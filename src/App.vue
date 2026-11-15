<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import HorseList from '@/components/HorseList.vue'
import RaceSchedule from '@/components/RaceSchedule.vue'
import RaceResults from '@/components/RaceResults.vue'
import RaceTrack from '@/components/RaceTrack.vue'
import { useRaceClock } from '@/composables/useRaceClock'
import { useRacingStore } from '@/stores/racing'

const racing = useRacingStore()
const { horses, rounds, status, activeRound, elapsedSeconds, completedRounds, progress } =
  storeToRefs(racing)
useRaceClock()

const displayedRound = computed(() =>
  activeRound.value
    ? (rounds.value.find((round) => round.number === activeRound.value?.roundNumber) ?? null)
    : (rounds.value[0] ?? null),
)

const raceStatus = computed(() => {
  if (status.value === 'running' || status.value === 'paused') {
    return `Round ${activeRound.value?.roundNumber} of 6 is ${status.value}.`
  }
  return {
    idle: 'Generate a schedule to begin.',
    ready: 'Schedule ready. Start when you are ready.',
    completed: 'All 6 rounds completed.',
  }[status.value]
})
function handleRaceControl() {
  if (status.value === 'running') racing.pauseRace()
  else if (status.value === 'paused') racing.resumeRace()
  else racing.startRace()
}
</script>

<template>
  <a class="skip-link" href="#race-heading">Skip to race</a>
  <main class="app-shell">
    <header class="app-header">
      <div>
        <h1>Horse Racing</h1>
        <p>20 horses. Six rounds. One race day.</p>
      </div>
      <div class="controls" role="group" aria-label="Race controls">
        <button
          class="secondary"
          type="button"
          :disabled="status === 'running' || status === 'paused'"
          @click="racing.generateProgram"
        >
          Generate schedule
        </button>
        <button
          type="button"
          :disabled="status === 'idle' || status === 'completed'"
          @click="handleRaceControl"
        >
          {{ status === 'running' ? 'Pause' : status === 'paused' ? 'Resume' : 'Start' }}
        </button>
      </div>
    </header>

    <div class="dashboard">
      <section id="race-workspace" class="race-workspace" aria-label="Race workspace">
        <section class="panel panel-heading race-status" aria-labelledby="race-heading">
          <h2 id="race-heading" tabindex="-1">Race status</h2>
          <p role="status" aria-label="Race status">{{ raceStatus }}</p>
          <p v-if="activeRound">
            {{ activeRound.distance }} m ·
            <span data-testid="round-time">{{ elapsedSeconds.toFixed(1) }} simulated seconds</span>
          </p>
          <p>Each round plays in approximately 8 seconds, excluding pauses.</p>
        </section>
        <RaceTrack :round="displayedRound" :horses="horses" :progress="progress" />
      </section>
      <div class="program-panels">
        <RaceResults :completed-rounds="completedRounds" :horses="horses" />
        <RaceSchedule :rounds="rounds" :horses="horses" />
      </div>
      <div class="roster-panel">
        <HorseList :horses="horses" />
      </div>
    </div>
  </main>
</template>

<style scoped>
.app-shell {
  max-width: 96rem;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

.skip-link {
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 20;
  transform: translateY(-200%);
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: #166534;
  color: white;
}

.skip-link:focus,
.skip-link:hover {
  transform: translateY(0);
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.25rem 0;
  border-bottom: 1px solid #cbd5e1;
  background: #f1f5f9;
}

h1 {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 2.25rem);
  letter-spacing: -0.04em;
}

.app-header p {
  margin: 0.5rem 0 0;
  color: #475569;
}

button {
  min-height: 2.75rem;
  border: 0;
  border-radius: 0.6rem;
  padding: 0.9rem 1.25rem;
  background: #166534;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background: #14532d;
}

button:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 4px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

button.secondary {
  background: white;
  color: #166534;
  box-shadow: inset 0 0 0 1px #166534;
}

button.secondary:hover:not(:disabled) {
  background: #f0fdf4;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.race-workspace {
  grid-area: race;
  display: grid;
  min-width: 0;
  gap: 1.25rem;
}

#race-heading {
  scroll-margin-top: 12rem;
}

#race-heading:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 5px;
}

.program-panels {
  grid-area: program;
  display: grid;
  min-width: 0;
  gap: 2rem;
}

.roster-panel {
  grid-area: roster;
  min-width: 0;
}

.race-status {
  border-left: 4px solid #166534;
}

.dashboard {
  display: grid;
  grid-template-columns: 21rem minmax(0, 1fr);
  grid-template-areas: 'roster race' 'program program';
  align-items: start;
  gap: 2rem;
}

@media (max-width: 60rem) {
  .dashboard {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'race' 'program' 'roster';
  }
}

@media (max-width: 36rem) {
  .app-shell {
    padding: 0 1.25rem 1.25rem;
  }

  h1 {
    font-size: 1.5rem;
  }

  .app-header p {
    display: none;
  }

  .app-header {
    padding: 0.75rem 0;
    gap: 0.75rem;
  }

  .controls button {
    flex: 1;
  }

  .app-header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
