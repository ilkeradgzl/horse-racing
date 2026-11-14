# Horse racing simulator specification

## Product requirements

- 20 horses available for racing, each with a unique color.
- Each horse has a condition score from 1 to 100.
- Generate creates a schedule containing six rounds.
- Each round selects 10 distinct random horses from the available 20.
- Horses may participate in multiple rounds.
- Distances, in order: 1200, 1400, 1600, 1800, 2000, and 2200 meters.
- Start executes rounds sequentially, one at a time.
- Horses visibly move during races.
- Results appear sequentially as each round concludes.

## Technical approach

- Vue 3, TypeScript, Vite, and Pinia.
- Composition API and `<script setup lang="ts">` components.
- Framework-independent business logic and shared game state managed by Pinia.
- Vitest and Vue Test Utils for unit and component tests; Playwright for browser tests.
- ESLint, Prettier, and strict TypeScript for code quality.
- Clear, maintainable components and modules with abstractions introduced as needed.

## Product decisions pending

Resolve each decision before implementing the affected behavior.

- Whether to support pause/resume and how it behaves between rounds.
- Visual direction and the intended fidelity to the reference design.
- Horse generation timing and behavior of Generate before, during, and after races.
- How condition affects performance. Proposed: higher condition improves expected
  performance, while randomness allows upsets. The formula remains undecided.
- Race duration, distance scaling, and transitions between rounds.
- Tie handling and the precise result fields.

## Outside current scope

Reset, fatigue, replay, persistence, authentication, additional race modes,
a backend, routing, and a UI framework require a separate scope decision.
