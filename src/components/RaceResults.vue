<script setup lang="ts">
import { computed } from 'vue'
import type { Horse } from '@/domain/horse'
import type { CompletedRound } from '@/stores/racing'

const props = defineProps<{
  completedRounds: readonly CompletedRound[]
  horses: readonly Horse[]
}>()
const horseNames = computed(() => new Map(props.horses.map((horse) => [horse.id, horse.name])))
</script>

<template>
  <section aria-labelledby="results-heading">
    <div class="results-heading">
      <h2 id="results-heading">Results</h2>
      <p>{{ completedRounds.length }} of 6 rounds completed</p>
    </div>
    <p v-if="!completedRounds.length" class="panel empty-results">
      Results appear after each round finishes.
    </p>
    <ol v-else class="results-list" aria-label="Completed rounds">
      <li v-for="round in completedRounds" :key="round.roundNumber" class="panel">
        <div class="panel-heading">
          <h3>Round {{ round.roundNumber }} · {{ round.distance }} m</h3>
        </div>
        <table>
          <caption class="sr-only">
            Round
            {{
              round.roundNumber
            }}
            results
          </caption>
          <thead>
            <tr>
              <th scope="col">Position</th>
              <th scope="col">Horse</th>
              <th scope="col">Time (s)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="result in round.results" :key="result.horseId">
              <td>{{ result.position }}</td>
              <th scope="row">{{ horseNames.get(result.horseId) }}</th>
              <td>{{ result.finishTime.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </li>
    </ol>
    <p class="time-note">Times are simulated race seconds, displayed to two decimal places.</p>
  </section>
</template>

<style scoped>
.results-heading {
  margin-bottom: 1.25rem;
}

.results-heading p,
.time-note {
  margin: 0.4rem 0 0;
  color: #475569;
  font-size: 0.875rem;
}

.empty-results {
  padding: 1.5rem;
  color: #475569;
}

.results-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding: 0;
  list-style: none;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  text-align: left;
  font-variant-numeric: tabular-nums;
}

th,
td {
  padding: 0.6rem 0.75rem;
  border-top: 1px solid #e2e8f0;
}

thead th {
  color: #475569;
  font-size: 0.75rem;
}

tbody th {
  font-weight: 500;
}

tbody tr:first-child {
  background: #f0fdf4;
}

tbody tr:first-child td:first-child {
  color: #166534;
  font-weight: 700;
}

@media (max-width: 60rem) {
  .results-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 36rem) {
  .results-list {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
