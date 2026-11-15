import { ref } from 'vue'
import { defineStore } from 'pinia'
import { generateHorses } from '@/domain/horse'
import { generateSchedule, type RaceRound } from '@/domain/schedule'

export const useRacingStore = defineStore('racing', () => {
  const horses = ref(generateHorses())
  const rounds = ref<RaceRound[]>([])

  function generateProgram() {
    rounds.value = generateSchedule(horses.value)
  }

  return { horses, rounds, generateProgram }
})
