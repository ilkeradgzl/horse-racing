import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateHorses } from '../horse'
import type { RaceRound } from '../schedule'
import { createRoundSimulation, getRoundProgress } from '../simulation'

function createFixture(condition = 50, distance = 1200) {
  const horses = generateHorses(() => 0.5).map((horse) => ({ ...horse, condition }))
  const round: RaceRound = {
    number: 1,
    distance,
    horseIds: horses.slice(0, 10).map((horse) => horse.id),
  }
  return { horses, round }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createRoundSimulation', () => {
  it.each([
    { condition: 1, random: 0, speed: 12.04 },
    { condition: 100, random: 0, speed: 16 },
    { condition: 50, random: 0.5, speed: 16.5 },
    { condition: 100, random: 1 - Number.EPSILON, speed: 21 },
  ])(
    'calculates speed for condition $condition and draw $random',
    ({ condition, random, speed }) => {
      const { horses, round } = createFixture(condition)
      const simulation = createRoundSimulation(round, horses, () => random)

      expect(simulation.roundNumber).toBe(1)
      expect(simulation.distance).toBe(1200)
      expect(simulation.runners.map((runner) => runner.horseId)).toEqual(round.horseIds)
      for (const runner of simulation.runners) {
        expect(runner.speed).toBeCloseTo(speed)
        expect(runner.finishTime).toBeCloseTo(1200 / speed)
      }
    },
  )

  it('favors higher condition when random draws are equal', () => {
    const { horses, round } = createFixture()
    horses[0]!.condition = 1
    horses[1]!.condition = 100
    const simulation = createRoundSimulation(round, horses, () => 0.5)

    expect(simulation.runners[1]!.speed).toBeGreaterThan(simulation.runners[0]!.speed)
    expect(simulation.runners[1]!.finishTime).toBeLessThan(simulation.runners[0]!.finishTime)
  })

  it('allows condition 1 to win against nine condition-100 horses', () => {
    const { horses, round } = createFixture(100)
    horses[0]!.condition = 1
    const random = vi.fn<() => number>().mockReturnValue(0).mockReturnValueOnce(0.99)
    const simulation = createRoundSimulation(round, horses, random)
    const completionTime = Math.max(...simulation.runners.map((runner) => runner.finishTime))
    const progress = getRoundProgress(simulation, completionTime)

    expect(progress.isComplete).toBe(true)
    expect(progress.results[0]?.horseId).toBe(horses[0]?.id)
  })

  it('samples once per participant and keeps those speeds across progress reads', () => {
    const { horses, round } = createFixture()
    const random = vi.fn(() => 0.5)
    const simulation = createRoundSimulation(round, horses, random)
    const original = structuredClone(simulation)

    getRoundProgress(simulation, 0)
    getRoundProgress(simulation, 10)
    getRoundProgress(simulation, 100)

    expect(random).toHaveBeenCalledTimes(10)
    expect(simulation).toEqual(original)

    random.mockReturnValue(0)
    const next = createRoundSimulation({ ...round, number: 2 }, horses, random)
    expect(random).toHaveBeenCalledTimes(20)
    expect(next.roundNumber).toBe(2)
    expect(next.runners[0]?.speed).not.toBe(simulation.runners[0]?.speed)
  })

  it('creates an independent snapshot without mutating roster or round', () => {
    const { horses, round } = createFixture()
    const original = structuredClone({ horses, round })
    horses.forEach(Object.freeze)
    Object.freeze(horses)
    Object.freeze(round.horseIds)
    Object.freeze(round)

    const first = createRoundSimulation(round, horses, () => 0)
    const second = createRoundSimulation(round, horses, () => 0)

    expect({ horses, round }).toEqual(original)
    expect(first).toEqual(second)
    expect(first.runners).not.toBe(second.runners)
    expect(first.runners[0]).not.toBe(second.runners[0])
  })

  it('does not depend on later roster or round changes', () => {
    const { horses, round } = createFixture()
    const simulation = createRoundSimulation(round, horses, () => 0)
    const original = structuredClone(simulation)

    horses[0]!.condition = 100
    round.distance = 2200
    round.horseIds.reverse()

    expect(simulation).toEqual(original)
  })

  it.each([0, -1, NaN, Infinity])('rejects invalid distance %s', (distance) => {
    const { horses, round } = createFixture(50, distance)
    expect(() => createRoundSimulation(round, horses)).toThrow('Round distance')
  })

  it('rejects an incomplete or duplicated participant list', () => {
    const { horses, round } = createFixture()
    expect(() => createRoundSimulation({ ...round, horseIds: [] }, horses)).toThrow('10 unique')
    expect(() =>
      createRoundSimulation({ ...round, horseIds: Array(10).fill('horse-01') }, horses),
    ).toThrow('10 unique')
  })

  it('rejects unknown participants and ambiguous roster IDs', () => {
    const { horses, round } = createFixture()
    expect(() => createRoundSimulation(round, horses.slice(1))).toThrow('missing from the roster')
    expect(() => createRoundSimulation(round, [...horses, horses[0]!])).toThrow(
      'IDs must be unique',
    )
  })

  it.each([0, 101, 1.5, NaN, Infinity])('rejects invalid condition %s', (condition) => {
    const { horses, round } = createFixture(condition)
    expect(() => createRoundSimulation(round, horses)).toThrow('integer from 1 to 100')
  })

  it('uses Math.random by default', () => {
    const { horses, round } = createFixture()
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(createRoundSimulation(round, horses)).toEqual(
      createRoundSimulation(round, horses, () => 0.5),
    )
  })
})

describe('getRoundProgress', () => {
  it('starts everyone at zero with no results', () => {
    const { horses, round } = createFixture()
    const progress = getRoundProgress(
      createRoundSimulation(round, horses, () => 0),
      0,
    )

    expect(progress.runners).toHaveLength(10)
    expect(progress.runners.every((runner) => runner.distance === 0 && !runner.finished)).toBe(true)
    expect(progress.isComplete).toBe(false)
    expect(progress.results).toEqual([])
  })

  it('calculates distance from total elapsed seconds without resampling', () => {
    const { horses, round } = createFixture()
    const simulation = createRoundSimulation(round, horses, () => 0)

    expect(getRoundProgress(simulation, 10).runners[0]?.distance).toBe(140)
    expect(getRoundProgress(simulation, 20).runners[0]?.distance).toBe(280)
  })

  it('produces the same progress regardless of intermediate frame reads', () => {
    const { horses, round } = createFixture()
    const simulation = createRoundSimulation(round, horses, () => 0.5)
    const direct = getRoundProgress(simulation, 30)

    for (let frame = 0; frame < 1800; frame += 1) {
      getRoundProgress(simulation, frame / 60)
    }

    expect(getRoundProgress(simulation, 30)).toEqual(direct)
  })

  it('finishes at the exact calculated crossing time and caps all later distances', () => {
    const { horses, round } = createFixture()
    const simulation = createRoundSimulation(round, horses, () => 0)
    const crossingTime = simulation.runners[0]!.finishTime

    expect(getRoundProgress(simulation, crossingTime - 0.001).isComplete).toBe(false)
    const atFinish = getRoundProgress(simulation, crossingTime)
    expect(atFinish.isComplete).toBe(true)
    expect(atFinish.runners.every((runner) => runner.distance === 1200 && runner.finished)).toBe(
      true,
    )
    expect(getRoundProgress(simulation, crossingTime + 100).runners).toEqual(atFinish.runners)
  })

  it('withholds results until the last participant finishes, even across a large time jump', () => {
    const { horses, round } = createFixture(100)
    horses[0]!.condition = 1
    const simulation = createRoundSimulation(round, horses, () => 0)
    const fastestTime = Math.min(...simulation.runners.map((runner) => runner.finishTime))
    const slowestTime = Math.max(...simulation.runners.map((runner) => runner.finishTime))
    const partial = getRoundProgress(simulation, fastestTime)

    expect(partial.runners.filter((runner) => runner.finished)).toHaveLength(9)
    expect(partial.isComplete).toBe(false)
    expect(partial.results).toEqual([])
    expect(getRoundProgress(simulation, slowestTime - 0.001).isComplete).toBe(false)
    const complete = getRoundProgress(simulation, slowestTime + 100)
    expect(complete.isComplete).toBe(true)
    expect(complete.results).toHaveLength(10)
    expect(complete.results[complete.results.length - 1]?.horseId).toBe(horses[0]?.id)
  })

  it('ranks by unrounded times and preserves participant order for exact ties', () => {
    const { horses, round } = createFixture(100)
    round.horseIds.reverse()
    const random = vi
      .fn<() => number>()
      .mockReturnValue(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.500001)
    const simulation = createRoundSimulation(round, horses, random)
    const progress = getRoundProgress(simulation, 1000)

    expect(simulation.runners[0]!.finishTime.toFixed(2)).toBe(
      simulation.runners[1]!.finishTime.toFixed(2),
    )
    expect(progress.results.map((result) => result.horseId)).toEqual([
      round.horseIds[1],
      round.horseIds[0],
      ...round.horseIds.slice(2),
    ])
    expect(progress.results.map((result) => result.position)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
    ])
    expect(progress.results[0]!.finishTime).toBeLessThan(progress.results[1]!.finishTime)
    expect(simulation.runners.map((runner) => runner.horseId)).toEqual(round.horseIds)
  })

  it('scales finish time with round distance while preserving speeds', () => {
    const { horses, round } = createFixture()
    const short = createRoundSimulation(round, horses, () => 0.5)
    const long = createRoundSimulation({ ...round, distance: 2200 }, horses, () => 0.5)

    expect(long.runners[0]?.speed).toBe(short.runners[0]?.speed)
    expect(long.runners[0]!.finishTime / short.runners[0]!.finishTime).toBeCloseTo(2200 / 1200)
  })

  it.each([-1, NaN, Infinity])('rejects invalid elapsed time %s', (elapsed) => {
    const { horses, round } = createFixture()
    const simulation = createRoundSimulation(round, horses, () => 0)
    expect(() => getRoundProgress(simulation, elapsed)).toThrow('Elapsed time')
  })
})
