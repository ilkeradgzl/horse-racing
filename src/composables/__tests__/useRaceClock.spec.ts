import { effectScope, type EffectScope } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRacingStore } from '@/stores/racing'
import { useRaceClock } from '../useRaceClock'

let scope: EffectScope
let frames: Map<number, FrameRequestCallback>
let nextId: number

function frame(timestamp: number) {
  const pending = [...frames.values()]
  frames.clear()
  pending.forEach((callback) => callback(timestamp))
}

function prepareClock() {
  const store = useRacingStore()
  store.horses.forEach((horse) => {
    horse.condition = 50
  })
  vi.spyOn(Math, 'random').mockReturnValue(0)
  store.generateProgram()
  scope.run(useRaceClock)
  return store
}

beforeEach(() => {
  setActivePinia(createPinia())
  scope = effectScope()
  frames = new Map()
  nextId = 0
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((callback: FrameRequestCallback) => {
      frames.set(++nextId, callback)
      return nextId
    }),
  )
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((id: number) => frames.delete(id)),
  )
})

afterEach(() => {
  scope.stop()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('useRaceClock', () => {
  it('waits for Start and advances a round over eight real seconds', () => {
    const store = prepareClock()
    expect(frames.size).toBe(0)
    store.startRace()
    expect(frames.size).toBe(1)
    frame(100)
    expect(store.elapsedSeconds).toBe(0)
    frame(2100)
    expect(store.progress?.runners[0]?.distance).toBeCloseTo(300)
    frame(8100)
    expect(store.completedRounds).toHaveLength(1)
    expect(store.activeRound?.roundNumber).toBe(2)
    expect(store.elapsedSeconds).toBe(0)
    expect(frames.size).toBe(1)
  })

  it('uses the new playback scale when a delayed frame crosses a round boundary', () => {
    const store = prepareClock()
    store.startRace()
    frame(0)
    frame(9000)
    expect(store.completedRounds).toHaveLength(1)
    expect(store.activeRound?.roundNumber).toBe(2)
    expect(store.progress?.runners[0]?.distance).toBeCloseTo(175)
  })

  it('cancels while paused and excludes paused time when resuming', () => {
    const store = prepareClock()
    store.startRace()
    frame(0)
    frame(2000)
    store.pauseRace()
    const elapsed = store.elapsedSeconds
    expect(frames.size).toBe(0)
    frame(60000)
    expect(store.elapsedSeconds).toBe(elapsed)
    store.resumeRace()
    expect(frames.size).toBe(1)
    frame(61000)
    expect(store.elapsedSeconds).toBe(elapsed)
    frame(63000)
    expect(store.progress?.runners[0]?.distance).toBeCloseTo(600)
  })

  it('handles a long frame and stops scheduling after all six rounds', () => {
    const store = prepareClock()
    store.startRace()
    frame(0)
    frame(100000)
    expect(store.status).toBe('completed')
    expect(store.completedRounds).toHaveLength(6)
    expect(frames.size).toBe(0)
    store.generateProgram()
    store.startRace()
    expect(frames.size).toBe(1)
    frame(101000)
    expect(store.elapsedSeconds).toBe(0)
  })

  it('produces equivalent progress across different frame frequencies', () => {
    const first = prepareClock()
    first.startRace()
    frame(0)
    frame(9000)
    const expected = first.progress!.runners[0]!.distance
    scope.stop()
    setActivePinia(createPinia())
    scope = effectScope()
    const second = prepareClock()
    second.startRace()
    frame(0)
    for (let time = 100; time <= 9000; time += 100) frame(time)
    expect(second.completedRounds).toHaveLength(1)
    expect(second.progress?.runners[0]?.distance).toBeCloseTo(expected, 8)
  })

  it('cancels pending frames when the owning scope is disposed', () => {
    const store = prepareClock()
    store.startRace()
    frame(0)
    scope.stop()
    expect(frames.size).toBe(0)
    frame(9000)
    expect(store.elapsedSeconds).toBe(0)
  })
})
