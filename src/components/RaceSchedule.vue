<script setup lang="ts">
import { computed } from 'vue'
import type { Horse } from '@/domain/horse'
import type { RaceRound } from '@/domain/schedule'

const props = defineProps<{ rounds: readonly RaceRound[]; horses: readonly Horse[] }>()

const scheduledRounds = computed(() => {
  const horsesById = new Map(props.horses.map((horse) => [horse.id, horse]))

  return props.rounds.map((round) => ({
    ...round,
    // Schedule generation guarantees that every participant belongs to the roster.
    participants: round.horseIds.map((id) => horsesById.get(id)!),
  }))
})
</script>

<template>
  <section aria-labelledby="schedule-heading">
    <div class="schedule-heading">
      <h2 id="schedule-heading">Race schedule</h2>
      <p role="status" aria-label="Schedule status">
        {{
          rounds.length ? `${rounds.length} rounds · 10 horses per round` : 'No schedule generated'
        }}
      </p>
    </div>

    <div v-if="!rounds.length" class="panel empty-state">
      <h3>Ready for the starting line</h3>
      <p>Generate a schedule to select the horses for all six rounds.</p>
    </div>

    <ol v-else class="rounds" aria-label="Scheduled rounds">
      <li v-for="round in scheduledRounds" :key="round.number" class="panel">
        <div class="panel-heading round-heading">
          <h3>Round {{ round.number }}</h3>
          <span>{{ round.distance }} m</span>
        </div>
        <ol class="participants" :aria-label="`Round ${round.number} participants`">
          <li v-for="horse in round.participants" :key="horse.id">
            <span
              class="color-swatch"
              :style="{ backgroundColor: horse.color }"
              aria-hidden="true"
            ></span>
            {{ horse.name }}
          </li>
        </ol>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.schedule-heading {
  margin-bottom: 1.25rem;
}

.schedule-heading p {
  margin: 0.4rem 0 0;
  color: #475569;
  font-size: 0.875rem;
}

.empty-state {
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-state p {
  color: #475569;
  line-height: 1.6;
}

.rounds {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.round-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.round-heading span {
  color: #475569;
  font-size: 0.875rem;
  white-space: nowrap;
}

.participants {
  padding: 0.5rem 1.25rem 0.5rem 3rem;
  font-size: 0.875rem;
}

.participants li {
  padding: 0.45rem 0;
}

.participants li::marker {
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

.participants .color-swatch {
  width: 0.65rem;
  height: 0.65rem;
  margin: 0 0.5rem;
}
@media (max-width: 60rem) {
  .rounds {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 36rem) {
  .rounds {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
