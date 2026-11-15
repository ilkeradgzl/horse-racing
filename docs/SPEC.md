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

## Horse roster

- Each horse has an ID, display name, color, and condition score.
- Generate exactly 20 horses, named `Horse 01` through `Horse 20`, with IDs
  `horse-01` through `horse-20`. IDs identify horses within a roster.
- Assign colors from a fixed palette of 20 distinct hexadecimal colors.
- IDs, names, and colors remain consistent across generated rosters.
- Generate each condition independently as a random integer from 1 to 100 inclusive.
- Each generation returns a new roster with new horse objects.
- Create the roster when the application initializes its racing store. Keep horse
  identities, colors, and conditions unchanged for that application session.
- Reloading the page creates a new roster; no data is persisted.

## Race schedule

- A schedule contains six rounds, numbered 1 through 6, in distance order.
- Each round stores its distance in meters and an ordered list of 10 horse IDs.
  The list is the participant order, not a predicted finishing order.
- Select participants uniformly without replacement within each round. Start each
  round's selection from the full roster; participation is not balanced across rounds.
- Require exactly 20 horses with unique IDs; reject invalid rosters with an error.
- Reference horses by ID rather than duplicating their names, colors, and conditions.
- Generation leaves the input roster unchanged and returns new rounds and participant arrays.

## Schedule interaction

- Show the 20-horse roster immediately, with no schedule selected initially.
- Generate schedule creates all six rounds using the current roster.
- Generating again replaces the entire schedule without changing horse data.
- Show each round's distance and ordered participant names.
- Keep the inspection interface responsive and usable by keyboard, with semantic
  table/list structure and a status announcement after generation.
- Generation behavior during and after race execution remains undecided.

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
- Behavior of Generate during and after races.
- How condition affects performance. Proposed: higher condition improves expected
  performance, while randomness allows upsets. The formula remains undecided.
- Race duration, distance scaling, and transitions between rounds.
- Tie handling and the precise result fields.

## Outside current scope

Reset, fatigue, replay, persistence, authentication, additional race modes,
a backend, routing, and a UI framework require a separate scope decision.
