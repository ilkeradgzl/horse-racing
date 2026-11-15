import type { Horse } from './horse'
import type { RaceRound } from './schedule'

export interface RaceRunner {
  readonly horseId: Horse['id']
  readonly speed: number
  readonly finishTime: number
}

export interface RoundSimulation {
  readonly roundNumber: number
  readonly distance: number
  readonly runners: readonly RaceRunner[]
}

export interface RunnerProgress {
  readonly horseId: Horse['id']
  readonly distance: number
  readonly finished: boolean
}

export interface RaceResult {
  readonly horseId: Horse['id']
  readonly position: number
  readonly finishTime: number
}

export interface RoundProgress {
  readonly runners: readonly RunnerProgress[]
  readonly isComplete: boolean
  readonly results: readonly RaceResult[]
}

const BASE_SPEED = 12
const CONDITION_SPEED_WEIGHT = 4
const RANDOM_SPEED_RANGE = 5

/** Sample once per participant. The random source must return a value in [0, 1). */
export function createRoundSimulation(
  round: RaceRound,
  horses: readonly Horse[],
  random: () => number = Math.random,
): RoundSimulation {
  if (!Number.isFinite(round.distance) || round.distance <= 0) {
    throw new Error('Round distance must be a finite positive number.')
  }
  if (round.horseIds.length !== 10 || new Set(round.horseIds).size !== 10) {
    throw new Error('A round requires exactly 10 unique participants.')
  }

  const horsesById = new Map(horses.map((horse) => [horse.id, horse]))
  if (horsesById.size !== horses.length) {
    throw new Error('Horse IDs must be unique within the roster.')
  }

  const participants = round.horseIds.map((id) => {
    const horse = horsesById.get(id)
    if (!horse) {
      throw new Error(`Participant ${id} is missing from the roster.`)
    }
    if (!Number.isInteger(horse.condition) || horse.condition < 1 || horse.condition > 100) {
      throw new Error(`Condition for ${id} must be an integer from 1 to 100.`)
    }
    return horse
  })

  const runners = participants.map((horse) => {
    const speed =
      BASE_SPEED + CONDITION_SPEED_WEIGHT * (horse.condition / 100) + RANDOM_SPEED_RANGE * random()

    return { horseId: horse.id, speed, finishTime: round.distance / speed }
  })

  return { roundNumber: round.number, distance: round.distance, runners }
}

/** Read progress from total elapsed simulation seconds, independent of previous calls. */
export function getRoundProgress(
  simulation: RoundSimulation,
  elapsedSeconds: number,
): RoundProgress {
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds < 0) {
    throw new Error('Elapsed time must be a finite non-negative number.')
  }

  const runners = simulation.runners.map((runner) => {
    const finished = elapsedSeconds >= runner.finishTime

    return {
      horseId: runner.horseId,
      distance: finished
        ? simulation.distance
        : Math.min(simulation.distance, runner.speed * elapsedSeconds),
      finished,
    }
  })
  const isComplete = runners.every((runner) => runner.finished)
  // Stable sorting preserves participant order for exact finish-time ties.
  const results = isComplete
    ? [...simulation.runners]
        .sort((a, b) => a.finishTime - b.finishTime)
        .map((runner, index) => ({
          horseId: runner.horseId,
          position: index + 1,
          finishTime: runner.finishTime,
        }))
    : []

  return { runners, isComplete, results }
}
