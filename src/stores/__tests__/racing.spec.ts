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
