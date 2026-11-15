import type { Horse } from './horse'

export interface RaceRound {
  number: number
  distance: number
  horseIds: Horse['id'][]
}

const ROUND_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] as const
const HORSES_PER_ROUND = 10
const ROSTER_SIZE = 20

/** The random source must return a value in [0, 1), like Math.random. */
export function generateSchedule(
  horses: readonly Horse[],
  random: () => number = Math.random,
): RaceRound[] {
  if (
    horses.length !== ROSTER_SIZE ||
    new Set(horses.map((horse) => horse.id)).size !== ROSTER_SIZE
  ) {
    throw new Error('A race schedule requires exactly 20 horses with unique IDs.')
  }

  return ROUND_DISTANCES.map((distance, index) => {
    const availableIds = horses.map((horse) => horse.id)
    const horseIds = Array.from({ length: HORSES_PER_ROUND }, () => {
      const selectedIndex = Math.floor(random() * availableIds.length)
      // The pool starts with 20 entries and only 10 are removed per round.
      return availableIds.splice(selectedIndex, 1)[0]!
    })

    return { number: index + 1, distance, horseIds }
  })
}
