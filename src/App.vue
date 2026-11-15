<script setup lang="ts">
import { storeToRefs } from 'pinia'
import HorseList from '@/components/HorseList.vue'
import RaceSchedule from '@/components/RaceSchedule.vue'
import { useRacingStore } from '@/stores/racing'

const racing = useRacingStore()
const { horses, rounds } = storeToRefs(racing)
</script>

<template>
  <main class="app-shell">
    <header class="app-header">
      <div>
        <h1>Horse Racing</h1>
        <p>20 horses. Six rounds. One race day.</p>
      </div>
      <button type="button" @click="racing.generateProgram">Generate schedule</button>
    </header>

    <div class="dashboard">
      <HorseList :horses="horses" />
      <RaceSchedule :rounds="rounds" :horses="horses" />
    </div>
  </main>
</template>

<style scoped>
.app-shell {
  max-width: 90rem;
  margin: 0 auto;
  padding: 2rem;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
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
  border: 0;
  border-radius: 0.6rem;
  padding: 0.9rem 1.25rem;
  background: #166534;
  color: white;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

button:hover {
  background: #14532d;
}

button:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 4px;
}

.dashboard {
  display: grid;
  grid-template-columns: 21rem minmax(0, 1fr);
  align-items: start;
  gap: 2rem;
}

@media (max-width: 60rem) {
  .dashboard {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 36rem) {
  .app-shell {
    padding: 1.25rem;
  }

  .app-header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
