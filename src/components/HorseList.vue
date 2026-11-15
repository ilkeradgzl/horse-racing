<script setup lang="ts">
import type { Horse } from '@/domain/horse'

defineProps<{ horses: readonly Horse[] }>()
</script>

<template>
  <section class="panel" aria-labelledby="horses-heading">
    <div class="panel-heading">
      <h2 id="horses-heading">Horse list</h2>
      <p>{{ horses.length }} horses · Condition 1–100</p>
    </div>
    <table>
      <caption class="sr-only">
        Available horses
      </caption>
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Condition</th>
          <th scope="col">Color</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="horse in horses" :key="horse.id">
          <th scope="row">{{ horse.name }}</th>
          <td>{{ horse.condition }}</td>
          <td>
            <span
              class="color-swatch"
              :style="{ backgroundColor: horse.color }"
              aria-hidden="true"
            ></span>
            <span class="sr-only">{{ horse.color }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.875rem;
}

th,
td {
  padding: 0.7rem 1rem;
  border-top: 1px solid #e2e8f0;
}

thead th {
  color: #475569;
  font-size: 0.75rem;
}

tbody th {
  font-weight: 500;
}

td:nth-child(2) {
  font-variant-numeric: tabular-nums;
}
</style>
