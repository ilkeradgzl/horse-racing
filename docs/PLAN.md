# Implementation plan

## Milestones

- [x] 1. Application foundation: Vue, TypeScript, Pinia, development tooling, and documentation.
- [x] 2. Horse and schedule generation: domain rules, focused unit tests, and a minimal inspection interface.
- [ ] 3. Race execution: simulation, shared lifecycle, sequential rounds, and results.
- [ ] 4. Racing interface: animated track, responsive layout, and accessible controls.
- [ ] 5. Release readiness: edge cases, critical end-to-end coverage, visual review, and documentation.

Define detailed scope and acceptance criteria before starting each milestone.
Track unresolved behavior in [the specification](SPEC.md).

## Foundation acceptance criteria

- Official create-vue scaffold with Vue 3, strict TypeScript, Vite, and registered Pinia.
- Vitest, Vue Test Utils, Playwright, ESLint, and Prettier configured.
- Starter demonstration content replaced with a minimal application shell.
- Repository instructions, setup guide, requirements, and milestones documented.
- Type checking, linting, formatting, component and browser smoke tests, production
  build, and development server startup verified.

## Milestone 2: horse and schedule generation

Each step is implemented, verified, and reviewed independently. A milestone may
contain multiple commits.

- [x] 2.1. Horse generation: domain type, fixed color palette, random conditions,
      and deterministic unit tests.
- [x] 2.2. Schedule generation: six rounds, required distances, distinct random
      participants within each round, and focused unit tests.
- [x] 2.3. Vue integration: Pinia state, Generate control, horse list, and schedule display.

### Step 2.1 acceptance criteria

- Generate 20 horses with unique IDs, display names, and colors.
- Use names `Horse 01` through `Horse 20` and a fixed palette of 20 distinct colors.
- Generate integer condition scores from 1 to 100 inclusive.
- Keep generation independent of Vue and Pinia, with an injectable random source
  for deterministic tests and Math.random as the default.
- Return fresh arrays and horse objects on every call.
- Verify generation rules, condition boundaries, and roster independence.
- Do not introduce schedule generation, shared state, or UI integration.

### Step 2.2 acceptance criteria

- Generate six rounds, numbered 1 through 6, at 1200, 1400, 1600, 1800, 2000,
  and 2200 meters in that order.
- Select 10 distinct roster members per round, referencing horses by ID.
- Sample each round independently from the complete roster without mutating it.
- Reject rosters that do not contain exactly 20 horses with unique IDs.
- Keep generation framework-independent, with an injectable random source.
- Verify distances, participant membership and uniqueness, repeat participation,
  input preservation, independent outputs, and invalid rosters.
- Do not introduce Pinia state, race execution, or UI integration.

### Step 2.3 acceptance criteria

- Initialize a session roster in one Pinia store; begin with an empty schedule.
- Generate and replace six rounds through a store action without changing horse data.
- Display the roster in a semantic table and rounds with participant names in lists.
- Keep presentation components separate from domain generation and shared state.
- Support keyboard generation, status announcements, and narrow viewports.
- Verify store initialization, schedule replacement, roster stability, component
  rendering, and the browser generation flow.
- Do not add Start/Pause controls, race execution, animation, or results.

Condition/performance modeling belongs to milestone 3. Resolve pause/resume and
regeneration during execution before implementing race controls, and visual
direction before final interface styling.
