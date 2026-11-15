import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { generateHorses } from '@/domain/horse'
import { generateSchedule, type RaceRound } from '@/domain/schedule'
import {
  createRoundSimulation,
  getRoundProgress,
  type RaceResult,
  type RoundSimulation,
} from '@/domain/simulation'

export type RacingStatus = 'idle' | 'ready' | 'running' | 'completed'

export interface CompletedRound {
  readonly roundNumber: number
  readonly distance: number
  readonly results: readonly RaceResult[]
}

export const useRacingStore = defineStore('racing', () => {
  const horses = ref(generateHorses())
  const rounds = ref<RaceRound[]>([])
  const status = ref<RacingStatus>('idle')
  const activeRound = shallowRef<RoundSimulation | null>(null)
  const elapsedSeconds = ref(0)
  const completedRounds = ref<CompletedRound[]>([])

  const progress = computed(() =>
    activeRound.value ? getRoundProgress(activeRound.value, elapsedSeconds.value) : null,
  )

  function generateProgram() {
    if (status.value === 'running') return

    rounds.value = generateSchedule(horses.value)
    activeRound.value = null
    elapsedSeconds.value = 0
    completedRounds.value = []
    status.value = 'ready'
  }

  function startRace() {
    if (status.value !== 'ready') return

    const firstRound = rounds.value[0]
    if (!firstRound) return

    activeRound.value = createRoundSimulation(firstRound, horses.value)
    elapsedSeconds.value = 0
    status.value = 'running'
  }

  /** Advance by simulation seconds since the last update, carrying time across rounds. */
  function advanceRace(deltaSeconds: number) {
    if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
      throw new Error('Time delta must be a finite non-negative number.')
    }

    let remainingSeconds = deltaSeconds
    while (status.value === 'running' && activeRound.value) {
      const simulation = activeRound.value
      const duration = Math.max(...simulation.runners.map((runner) => runner.finishTime))
      const timeToFinish = duration - elapsedSeconds.value

      if (remainingSeconds < timeToFinish) {
        elapsedSeconds.value += remainingSeconds
        return
      }

      elapsedSeconds.value = duration
      remainingSeconds -= timeToFinish
      completedRounds.value.push({
        roundNumber: simulation.roundNumber,
        distance: simulation.distance,
        results: getRoundProgress(simulation, duration).results,
      })

      const nextRound = rounds.value[completedRounds.value.length]
      if (!nextRound) {
        status.value = 'completed'
        return
      }

      activeRound.value = createRoundSimulation(nextRound, horses.value)
      elapsedSeconds.value = 0
    }
  }

  return {
    horses,
    rounds,
    status,
    activeRound,
    elapsedSeconds,
    completedRounds,
    progress,
    generateProgram,
    startRace,
    advanceRace,
  }
})
