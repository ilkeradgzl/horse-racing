import { afterEach, describe, expect, it, vi } from 'vitest'
import { generateHorses } from '../horse'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('generateHorses', () => {
  it('creates 20 horses with unique identities and colors', () => {
    const horses = generateHorses(() => 0.5)

    expect(horses).toHaveLength(20)
    expect(new Set(horses.map((horse) => horse.id)).size).toBe(20)
    expect(new Set(horses.map((horse) => horse.name)).size).toBe(20)
    expect(new Set(horses.map((horse) => horse.color)).size).toBe(20)
    expect(horses[0]).toMatchObject({ id: 'horse-01', name: 'Horse 01' })
    expect(horses[19]).toMatchObject({ id: 'horse-20', name: 'Horse 20' })
    expect(horses.every((horse) => /^#[0-9A-F]{6}$/.test(horse.color))).toBe(true)
  })

  it.each([
    { random: 0, condition: 1 },
    { random: 0.009, condition: 1 },
    { random: 0.01, condition: 2 },
    { random: 0.5, condition: 51 },
    { random: 0.99, condition: 100 },
    { random: 1 - Number.EPSILON, condition: 100 },
  ])('maps random value $random to condition $condition', ({ random, condition }) => {
    const horses = generateHorses(() => random)

    expect(horses.every((horse) => horse.condition === condition)).toBe(true)
  })

  it('generates a condition for each horse within the integer bounds', () => {
    let value = 0
    const horses = generateHorses(() => {
      const random = value / 20
      value += 1
      return random
    })

    expect(new Set(horses.map((horse) => horse.condition)).size).toBe(20)
    for (const horse of horses) {
      expect(Number.isInteger(horse.condition)).toBe(true)
      expect(horse.condition).toBeGreaterThanOrEqual(1)
      expect(horse.condition).toBeLessThanOrEqual(100)
    }
  })

  it('preserves identities and colors across independently generated rosters', () => {
    const first = generateHorses(() => 0)
    const second = generateHorses(() => 0.99)

    expect(first.map(({ id, name, color }) => ({ id, name, color }))).toEqual(
      second.map(({ id, name, color }) => ({ id, name, color })),
    )
    expect(first.every((horse) => horse.condition === 1)).toBe(true)
    expect(second.every((horse) => horse.condition === 100)).toBe(true)
    expect(first).not.toBe(second)
    first.forEach((horse, index) => {
      expect(horse).not.toBe(second[index])
    })
  })

  it('uses Math.random when no random source is provided', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.42)

    expect(generateHorses().every((horse) => horse.condition === 43)).toBe(true)
  })
})
