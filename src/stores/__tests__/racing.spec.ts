import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useRacingStore } from '../racing'

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('racing store', () => {
  it('initializes one roster with no scheduled rounds', () => {
    const store = useRacingStore()

    expect(store.horses).toHaveLength(20)
    expect(store.rounds).toEqual([])
    expect(store.status).toBe('idle')
    expect(store.activeRound).toBeNull()
    expect(store.progress).toBeNull()
    expect(store.elapsedSeconds).toBe(0)
    expect(store.completedRounds).toEqual([])
    expect(useRacingStore().horses).toBe(store.horses)
  })

  it('replaces the schedule without changing the roster', () => {
    const store = useRacingStore()
    const roster = store.horses
    const original = roster.map((horse) => ({ ...horse }))
    vi.spyOn(Math, 'random').mockReturnValue(0)
    store.generateProgram()
    const first = store.rounds

    vi.mocked(Math.random).mockReturnValue(1 - Number.EPSILON)
    store.generateProgram()

    expect(store.status).toBe('ready')
    expect(store.rounds).toHaveLength(6)
    expect(store.rounds).not.toBe(first)
    expect(store.rounds[0]?.horseIds).not.toEqual(first[0]?.horseIds)
    expect(store.horses).toBe(roster)
    expect(store.horses).toEqual(original)
    for (const round of store.rounds) {
      expect(round.horseIds).toHaveLength(10)
      expect(new Set(round.horseIds).size).toBe(10)
      expect(round.horseIds.every((id) => roster.some((horse) => horse.id === id))).toBe(true)
    }
  })

  it('does not share state across application instances', () => {
    const first = useRacingStore()
    first.generateProgram()

    setActivePinia(createPinia())
    const second = useRacingStore()

    expect(second.rounds).toEqual([])
    expect(second.horses).not.toBe(first.horses)
  })
})

// Equal conditions and zero draws give every participant a speed of 14 m/s.
function prepareRace() {
  const store = useRacingStore()
  store.horses.forEach((horse) => {
    horse.condition = 50
  })
  vi.spyOn(Math, 'random').mockReturnValue(0)
  store.generateProgram()
  return store
}

function activeDuration(store: ReturnType<typeof useRacingStore>) {
  if (!store.activeRound) throw new Error('Expected an active round in the test.')
  return Math.max(...store.activeRound.runners.map((runner) => runner.finishTime))
}

describe('race lifecycle', () => {
  it('starts the first scheduled round at zero without changing the roster or schedule', () => {
    const store = prepareRace()
    const roster = store.horses.map((horse) => ({ ...horse }))
    const rounds = structuredClone(
      store.rounds.map((round) => ({ ...round, horseIds: [...round.horseIds] })),
    )

    store.startRace()

    expect(store.status).toBe('running')
    expect(store.activeRound?.roundNumber).toBe(1)
    expect(store.activeRound?.distance).toBe(1200)
    expect(store.activeRound?.runners.map((runner) => runner.horseId)).toEqual(
      store.rounds[0]?.horseIds,
    )
    expect(store.elapsedSeconds).toBe(0)
    expect(store.progress?.runners.every((runner) => runner.distance === 0)).toBe(true)
    expect(store.completedRounds).toEqual([])
    expect(store.horses).toEqual(roster)
    expect(store.rounds).toEqual(rounds)
  })

  it('ignores Start before generation and repeated Start while running', () => {
    const store = useRacingStore()
    store.startRace()
    expect(store.status).toBe('idle')
    expect(store.activeRound).toBeNull()

    store.generateProgram()
    store.startRace()
    store.advanceRace(10)
    const active = store.activeRound
    const elapsed = store.elapsedSeconds
    const results = store.completedRounds
    const random = vi.spyOn(Math, 'random')
    store.startRace()

    expect(store.activeRound).toBe(active)
    expect(store.elapsedSeconds).toBe(elapsed)
    expect(store.completedRounds).toBe(results)
    expect(random).not.toHaveBeenCalled()
  })

  it('updates progress without resampling speeds or prematurely recording results', () => {
    const store = prepareRace()
    store.startRace()
    vi.mocked(Math.random).mockClear()
    const active = store.activeRound

    store.advanceRace(0)
    expect(store.elapsedSeconds).toBe(0)
    store.advanceRace(10)
    store.advanceRace(5)

    expect(store.elapsedSeconds).toBe(15)
    expect(store.progress?.runners[0]?.distance).toBe(210)
    expect(store.status).toBe('running')
    expect(store.activeRound).toBe(active)
    expect(store.completedRounds).toEqual([])
    expect(Math.random).not.toHaveBeenCalled()
  })

  it('waits for the final participant before starting the next round', () => {
    const store = prepareRace()
    store.horses[0]!.condition = 1
    store.startRace()
    const fastest = Math.min(...store.activeRound!.runners.map((runner) => runner.finishTime))
    const duration = activeDuration(store)
    store.advanceRace(fastest)

    expect(store.progress?.runners.filter((runner) => runner.finished)).toHaveLength(9)
    expect(store.activeRound?.roundNumber).toBe(1)
    expect(store.completedRounds).toEqual([])
    store.advanceRace(duration - fastest)

    expect(store.completedRounds).toHaveLength(1)
    expect(store.completedRounds[0]?.results[9]?.horseId).toBe('horse-01')
    expect(store.activeRound?.roundNumber).toBe(2)
    expect(store.elapsedSeconds).toBe(0)
  })

  it('records results once and starts the next round at an exact boundary', () => {
    const store = prepareRace()
    store.startRace()
    const first = store.activeRound!
    vi.mocked(Math.random).mockClear()

    store.advanceRace(activeDuration(store))

    expect(store.completedRounds).toHaveLength(1)
    expect(store.completedRounds[0]?.roundNumber).toBe(1)
    expect(store.completedRounds[0]?.distance).toBe(1200)
    expect(store.completedRounds[0]?.results.map((result) => result.horseId)).toEqual(
      first.runners.map((runner) => runner.horseId),
    )
    expect(store.activeRound?.roundNumber).toBe(2)
    expect(store.elapsedSeconds).toBe(0)
    expect(store.progress?.isComplete).toBe(false)
    expect(Math.random).toHaveBeenCalledTimes(10)

    store.advanceRace(0)
    expect(store.completedRounds).toHaveLength(1)
    expect(Math.random).toHaveBeenCalledTimes(10)
  })

  it('carries excess time through multiple rounds and retains prior results', () => {
    const store = prepareRace()
    store.startRace()
    const firstDuration = activeDuration(store)
    const secondDuration = 1400 / 14

    store.advanceRace(firstDuration + secondDuration + 5)

    expect(store.completedRounds.map((round) => round.roundNumber)).toEqual([1, 2])
    expect(store.activeRound?.roundNumber).toBe(3)
    expect(store.elapsedSeconds).toBeCloseTo(5)
    expect(store.progress?.runners[0]?.distance).toBeCloseTo(70)
    const firstResults = store.completedRounds[0]
    store.advanceRace(1)
    expect(store.completedRounds[0]).toBe(firstResults)
  })

  it('completes all six rounds in order and keeps the final frame at the finish line', () => {
    const store = prepareRace()
    const horses = store.horses.map((horse) => ({ ...horse }))
    store.startRace()
    store.advanceRace(10000)

    expect(store.status).toBe('completed')
    expect(store.completedRounds.map((round) => round.roundNumber)).toEqual([1, 2, 3, 4, 5, 6])
    expect(store.completedRounds.map((round) => round.distance)).toEqual([
      1200, 1400, 1600, 1800, 2000, 2200,
    ])
    for (const completed of store.completedRounds) {
      expect(completed.results).toHaveLength(10)
      expect(completed.results.map((result) => result.position)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ])
      expect(new Set(completed.results.map((result) => result.horseId))).toEqual(
        new Set(store.rounds[completed.roundNumber - 1]?.horseIds),
      )
    }
    expect(store.activeRound?.roundNumber).toBe(6)
    expect(store.elapsedSeconds).toBeCloseTo(2200 / 14)
    expect(store.progress?.isComplete).toBe(true)
    expect(store.progress?.runners.every((runner) => runner.distance === 2200)).toBe(true)
    expect(store.horses).toEqual(horses)

    const active = store.activeRound
    const elapsed = store.elapsedSeconds
    store.startRace()
    store.advanceRace(100)
    expect(store.status).toBe('completed')
    expect(store.completedRounds).toHaveLength(6)
    expect(store.activeRound).toBe(active)
    expect(store.elapsedSeconds).toBe(elapsed)
  })

  it('produces equivalent progress and results for one large update or many small updates', () => {
    const first = prepareRace()
    first.startRace()
    first.advanceRace(250)
    const expected = {
      completed: first.completedRounds.map((round) => ({ ...round, results: [...round.results] })),
      active: first.activeRound,
      progress: first.progress,
      elapsed: first.elapsedSeconds,
    }

    setActivePinia(createPinia())
    const second = prepareRace()
    second.startRace()
    for (let tick = 0; tick < 2500; tick += 1) second.advanceRace(0.1)

    expect(second.completedRounds).toEqual(expected.completed)
    expect(second.activeRound).toEqual(expected.active)
    expect(second.elapsedSeconds).toBeCloseTo(expected.elapsed, 8)
    expect(second.progress?.runners[0]?.distance).toBeCloseTo(
      expected.progress!.runners[0]!.distance,
      8,
    )
    expect(second.progress?.isComplete).toBe(expected.progress?.isComplete)
  })

  it('ignores generation while running and clears race state on generation after completion', () => {
    const store = prepareRace()
    const roster = store.horses
    store.startRace()
    store.advanceRace(10)
    const rounds = store.rounds
    const active = store.activeRound
    vi.mocked(Math.random).mockClear()

    store.generateProgram()

    expect(store.status).toBe('running')
    expect(store.rounds).toBe(rounds)
    expect(store.activeRound).toBe(active)
    expect(store.elapsedSeconds).toBe(10)
    expect(Math.random).not.toHaveBeenCalled()

    store.advanceRace(10000)
    store.generateProgram()

    expect(store.status).toBe('ready')
    expect(store.rounds).not.toBe(rounds)
    expect(store.rounds).toHaveLength(6)
    expect(store.horses).toBe(roster)
    expect(store.activeRound).toBeNull()
    expect(store.elapsedSeconds).toBe(0)
    expect(store.completedRounds).toEqual([])
    expect(store.progress).toBeNull()
    store.startRace()
    expect(store.status).toBe('running')
    expect(store.activeRound?.roundNumber).toBe(1)
  })

  it('ignores valid time updates before Start', () => {
    const store = useRacingStore()
    store.advanceRace(100)
    expect(store.status).toBe('idle')
    expect(store.elapsedSeconds).toBe(0)
    store.generateProgram()
    store.advanceRace(100)
    expect(store.status).toBe('ready')
    expect(store.activeRound).toBeNull()
    expect(store.completedRounds).toEqual([])
  })

  it.each([-1, NaN, Infinity])('rejects invalid delta %s without changing race state', (delta) => {
    const store = prepareRace()
    store.startRace()
    const active = store.activeRound
    expect(() => store.advanceRace(delta)).toThrow('Time delta')
    expect(store.activeRound).toBe(active)
    expect(store.elapsedSeconds).toBe(0)
    expect(store.completedRounds).toEqual([])
    expect(store.status).toBe('running')
  })
})

describe('pause and resume', () => {
  it('preserves race state while paused and resumes without new speed draws', () => {
    const store = prepareRace()
    store.startRace()
    store.advanceRace(activeDuration(store) + 10)
    const active = store.activeRound
    const elapsed = store.elapsedSeconds
    const results = store.completedRounds.map((round) => ({
      ...round,
      results: [...round.results],
    }))
    const rounds = store.rounds
    const progress = store.progress
    vi.mocked(Math.random).mockClear()

    store.pauseRace()
    store.pauseRace()
    store.startRace()
    store.generateProgram()
    store.advanceRace(10000)

    expect(store.status).toBe('paused')
    expect(store.activeRound).toBe(active)
    expect(store.elapsedSeconds).toBe(elapsed)
    expect(store.rounds).toBe(rounds)
    expect(store.completedRounds).toEqual(results)
    expect(store.progress).toEqual(progress)
    expect(Math.random).not.toHaveBeenCalled()

    store.resumeRace()
    store.resumeRace()
    store.advanceRace(1)

    expect(store.status).toBe('running')
    expect(store.activeRound).toBe(active)
    expect(store.elapsedSeconds).toBe(elapsed + 1)
    expect(Math.random).not.toHaveBeenCalled()
  })

  it('ignores pause and resume outside their valid states', () => {
    const store = useRacingStore()
    store.pauseRace()
    store.resumeRace()
    expect(store.status).toBe('idle')
    store.generateProgram()
    store.pauseRace()
    store.resumeRace()
    expect(store.status).toBe('ready')
    store.startRace()
    store.advanceRace(10000)
    store.pauseRace()
    store.resumeRace()
    expect(store.status).toBe('completed')
    expect(store.completedRounds).toHaveLength(6)
  })
})
