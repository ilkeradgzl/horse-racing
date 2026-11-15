<script setup lang="ts">
import { computed } from 'vue'
import HorseIcon from '@/components/HorseIcon.vue'
import type { Horse } from '@/domain/horse'
import type { RaceRound } from '@/domain/schedule'
import type { RoundProgress } from '@/domain/simulation'

const props = defineProps<{
  round: RaceRound | null
  horses: readonly Horse[]
  progress: RoundProgress | null
}>()

// Resolve the fixed lane participants only when the roster or displayed round changes.
const participants = computed(() =>
  (props.round?.horseIds ?? []).map((id) => props.horses.find((horse) => horse.id === id)!),
)

const lanes = computed(() => {
  const progressById = new Map(props.progress?.runners.map((runner) => [runner.horseId, runner]))
  const roundDistance = props.round?.distance ?? 1

  return participants.value.map((horse) => {
    const runner = progressById.get(horse.id)
    const distance = Math.min(roundDistance, Math.max(0, runner?.distance ?? 0))
    return {
      horse,
      distance,
      percentage: (distance / roundDistance) * 100,
      finished: runner?.finished ?? false,
    }
  })
})
</script>

<template>
  <section class="panel race-track" aria-labelledby="track-heading">
    <div class="panel-heading track-heading">
      <h2 id="track-heading">Race track</h2>
      <p v-if="round">Round {{ round.number }} · {{ round.distance }} m</p>
      <p v-else>Generate a schedule to line up the horses.</p>
    </div>

    <template v-if="round">
      <p class="reduced-motion-note">
        Moving horse indicators are hidden. Follow the lane distances and results.
      </p>
      <div class="track-labels" aria-hidden="true">
        <span>Start</span>
        <span>Finish</span>
      </div>
      <ol class="lanes" aria-label="Race lanes">
        <li v-for="(lane, index) in lanes" :key="lane.horse.id" class="lane">
          <div class="lane-info">
            <span class="lane-number" aria-hidden="true">{{ index + 1 }}</span>
            <div>
              <span class="horse-name">{{ lane.horse.name }}</span>
              <span class="lane-distance">{{
                lane.finished ? 'Finished' : `${Math.floor(lane.distance)} m`
              }}</span>
            </div>
          </div>
          <div class="runway">
            <div
              class="course"
              role="progressbar"
              :aria-label="`${lane.horse.name} race progress`"
              :aria-valuenow="Math.round(lane.percentage)"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :aria-valuetext="`${Math.floor(lane.distance)} of ${round.distance} meters`"
            >
              <span class="finish-line" aria-hidden="true"></span>
              <span
                class="runner-position"
                :style="{ transform: `translateX(${lane.percentage}%)`, color: lane.horse.color }"
                aria-hidden="true"
              >
                <HorseIcon class="horse-icon" />
              </span>
            </div>
          </div>
        </li>
      </ol>
    </template>
  </section>
</template>

<style scoped>
.track-heading {
  border-bottom: 1px solid #e2e8f0;
}

.track-labels {
  display: flex;
  justify-content: space-between;
  margin: 0 1.4rem 0 9.4rem;
  padding: 0.65rem 0;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 600;
}

.lanes {
  margin: 0;
  padding: 0;
  list-style: none;
}

.lane {
  display: grid;
  grid-template-columns: 8rem minmax(0, 1fr);
  min-height: 3.5rem;
  overflow: hidden;
  border-top: 1px dashed #cbd5e1;
}

.lane:nth-child(odd) {
  background: #f0fdf4;
}

.lane-info {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.5rem 0.75rem;
  background: rgb(255 255 255 / 70%);
  border-right: 1px solid #cbd5e1;
}

.lane-number {
  color: #475569;
  font-size: 0.75rem;
  font-variant-numeric: tabular-nums;
}

.horse-name,
.lane-distance {
  display: block;
  white-space: nowrap;
}

.horse-name {
  font-size: 0.8rem;
  font-weight: 600;
}

.lane-distance {
  margin-top: 0.2rem;
  color: #475569;
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}

.runway {
  min-width: 0;
  padding: 0 1.4rem;
}

.course {
  position: relative;
  height: 100%;
  border-left: 1px solid #94a3b8;
}

.finish-line {
  position: absolute;
  top: 0;
  right: -2px;
  bottom: 0;
  width: 4px;
  background: repeating-linear-gradient(to bottom, #166534 0 5px, white 5px 10px);
}

.runner-position {
  position: absolute;
  inset: 0;
}

.horse-icon {
  position: absolute;
  top: 50%;
  left: -1.25rem;
  width: 2.5rem;
  height: 2rem;
  transform: translateY(-50%);
}

.reduced-motion-note {
  display: none;
  padding: 0 1rem;
  color: #475569;
  font-size: 0.875rem;
  line-height: 1.5;
}

@media (max-width: 36rem) {
  .lane {
    grid-template-columns: 6.5rem minmax(0, 1fr);
  }

  .lane-info {
    gap: 0.4rem;
    padding: 0.5rem;
  }

  .track-labels {
    margin-left: 7.9rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .runner-position {
    display: none;
  }

  .reduced-motion-note {
    display: block;
  }
}
</style>
