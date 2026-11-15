import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateHorses } from '../horse'
import { generateSchedule } from '../schedule'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('generateSchedule', () => {
  it('creates six numbered rounds with the required distance sequence', () => {
    const rounds = generateSchedule(
      generateHorses(() => 0.5),
      () => 0.5,
    )

    expect(rounds.map((round) => round.number)).toEqual([1, 2, 3, 4, 5, 6])
    expect(rounds.map((round) => round.distance)).toEqual([1200, 1400, 1600, 1800, 2000, 2200])
  })

  it.each([0, 0.5, 1 - Number.EPSILON])(
    'selects 10 distinct roster members per round with random value %s',
    (random) => {
      const horses = generateHorses(() => 0.5)
      const rosterIds = new Set(horses.map((horse) => horse.id))
      const rounds = generateSchedule(horses, () => random)

      for (const round of rounds) {
        expect(round.horseIds).toHaveLength(10)
        expect(new Set(round.horseIds).size).toBe(10)
        expect(round.horseIds.every((id) => rosterIds.has(id))).toBe(true)
      }
    },
  )

  it('uses randomness to select participants from the whole roster', () => {
    const horses = generateHorses(() => 0.5)
    const first = generateSchedule(horses, () => 0)
    const last = generateSchedule(horses, () => 1 - Number.EPSILON)

    expect(first[0]?.horseIds).toEqual(horses.slice(0, 10).map((horse) => horse.id))
    expect(last[0]?.horseIds).toEqual(
      horses
        .slice(10)
        .reverse()
        .map((horse) => horse.id),
    )
  })

  it('selects each round independently and allows horses to return in later rounds', () => {
    const horses = generateHorses(() => 0.5)
    let draws = 0
    const rounds = generateSchedule(horses, () => {
      const random = Math.floor(draws / 10) % 2 === 0 ? 0 : 1 - Number.EPSILON
      draws += 1
      return random
    })

    expect(rounds[0]?.horseIds).not.toEqual(rounds[1]?.horseIds)
    expect(rounds[0]?.horseIds).toEqual(rounds[2]?.horseIds)
    expect(rounds[1]?.horseIds).toEqual(rounds[3]?.horseIds)
  })

  it('does not mutate the roster or its horses', () => {
    const horses = Object.freeze(generateHorses(() => 0.5).map((horse) => Object.freeze(horse)))
    const original = structuredClone(horses)

    generateSchedule(horses, () => 0.5)

    expect(horses).toEqual(original)
  })

  it('returns independent schedules and participant arrays', () => {
    const horses = generateHorses(() => 0.5)
    const first = generateSchedule(horses, () => 0.5)
    const second = generateSchedule(horses, () => 0.5)

    expect(first).toEqual(second)
    expect(first).not.toBe(second)
    expect(new Set(first.map((round) => round.horseIds)).size).toBe(6)
    first.forEach((round, index) => {
      expect(round).not.toBe(second[index])
      expect(round.horseIds).not.toBe(second[index]?.horseIds)
    })
  })

  it.each([0, 9, 19, 21])('rejects a roster of %i horses', (count) => {
    const horses = generateHorses(() => 0.5)
    const roster = Array.from({ length: count }, (_, index) => ({
      ...horses[index % horses.length]!,
      id: `horse-${index}`,
    }))

    expect(() => generateSchedule(roster)).toThrow(
      'A race schedule requires exactly 20 horses with unique IDs.',
    )
  })

  it('rejects duplicate horse IDs', () => {
    const horses = generateHorses(() => 0.5).map((horse) => ({ ...horse, id: 'duplicate' }))

    expect(() => generateSchedule(horses)).toThrow(
      'A race schedule requires exactly 20 horses with unique IDs.',
    )
  })

  it('uses Math.random when no random source is provided', () => {
    const horses = generateHorses(() => 0.5)
    vi.spyOn(Math, 'random').mockReturnValue(0)

    expect(generateSchedule(horses)).toEqual(generateSchedule(horses, () => 0))
  })
})
