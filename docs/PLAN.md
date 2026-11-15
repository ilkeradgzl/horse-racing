# Implementation plan

## Milestones

- [x] 1. Application foundation: Vue, TypeScript, Pinia, development tooling, and documentation.
- [x] 2. Horse and schedule generation: domain rules, focused unit tests, and a minimal inspection interface.
- [x] 3. Race execution: simulation, shared lifecycle, sequential rounds, and results.
- [x] 4. Racing interface: animated track, responsive layout, and accessible controls.
- [x] 5. Release readiness: edge cases, critical end-to-end coverage, visual review, and documentation.

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

## Milestone 3: race execution

- [x] 3.1. Single-round simulation: condition-weighted speeds, progress, finish
      times, deterministic finishing order, and domain tests.
- [x] 3.2. Race lifecycle: shared state transitions, elapsed simulation time,
      sequential rounds, and completed-round results.
- [x] 3.3. Controls and results: Start, round status, result display, and
      pause/resume.

### Step 3.1 acceptance criteria

- Implement the selected simulation rules in docs/SPEC.md as framework-independent TypeScript.
- Sample each participant's speed once per round using an injectable random source.
- Favor higher condition with equal random draws; permit a condition-1 horse to
  beat a condition-100 horse with suitable draws.
- Derive progress and finish times from elapsed simulation time without timers or animation.
- Cap distance at the finish line, rank by unrounded finish times, and use participant
  order to break exact ties.
- Complete the round only after every participant finishes.
- Verify boundary conditions, upsets, ranking, ties, and frame-rate-independent progress
  with deterministic tests rather than probabilistic pass/fail thresholds.
- Do not introduce controls, animation, or race lifecycle integration in this step.

### Step 3.2 acceptance criteria

- Add idle, ready, running, and completed states to the Pinia store.
- Start a ready schedule once; ignore invalid or duplicate Start calls.
- Track active-round progress and retain completed results in schedule order.
- Advance from externally supplied simulation-time deltas, carrying excess time
  across immediate round transitions without resampling an active round.
- Finish only after all six rounds; keep the final round at the finish line.
- Block generation while running. Generation after completion clears race state
  while retaining the roster; a new schedule is required before another Start.
- Verify state transitions, partial finishes, exact boundaries, late updates,
  invalid deltas, results, and equivalent progress across update sizes.
- Do not introduce timers, controls, animations, or pause/resume in this step.

### Step 3.3 acceptance criteria

- Add guarded Pause/Resume actions without changing sampled speeds or losing progress.
- Connect Start/Pause/Resume and disable Generate during running and paused states.
- Drive races with a scoped requestAnimationFrame clock at approximately eight real
  seconds per round, preserving remaining real time across changes of playback scale.
- Exclude paused time and cancel pending frames on Pause, completion, and disposal.
- Display round status and completed results with positions, names, and simulated
  finish times rounded for display only.
- Verify pause guards, clock scaling and cleanup, controls, incremental result display,
  complete program execution, and narrow layouts.
- Keep horse track animation and final visual design in milestone 4.

## Milestone 4: racing interface

- [x] 4.1. Animated track: preview, ten participant lanes, simulation-driven horse
      movement, pause and finish states, responsive bounds, and reduced motion.
- [x] 4.2. Interface polish: review dashboard arrangement, responsive hierarchy,
      visual consistency, and accessibility across the complete experience.

### Step 4.1 acceptance criteria

- Keep the selected green and neutral visual style without rearranging the dashboard.
- Show a first-round preview after generation and the active round during execution.
- Position colored SVG horses from domain progress, without new timers or racing rules.
- Keep horse artwork in a dedicated icon component; the track owns positioning and color.
- Preserve participant order, reset positions for new rounds, freeze on Pause, and
  retain finish-line positions after program completion.
- Provide lane names, distances, and accessible progress descriptions.
- Support a 320px viewport and reduced-motion preferences.
- Verify position mapping, round changes, pause/resume, finish states, and browser movement.

### Step 4.2 acceptance criteria

- Prioritize race status and the track before supporting data on narrow screens.
- Keep controls reachable while scrolling, without obscuring keyboard navigation.
- Show results before the complete schedule; preserve all roster, schedule, and result data.
- Use consistent card spacing and readable tables at desktop, tablet, and 320px widths.
- Provide a skip link to the race heading with visible focus, native anchor navigation, CSS header clearance,
  and stable repeated keyboard/pointer activation in empty and generated states.
- Review running, paused, completed, and reduced-motion views in the browser.
- Do not change simulation rules, timing, shared state, or product scope.

## Milestone 5: release readiness

- [x] 5.1. Audit: review requirements, race edge cases, accessibility coverage,
      production-build browser behavior, and dependency advisories.
- [x] 5.2. Audit follow-ups: make production-build browser verification repeatable,
      reconcile specification wording, and document remaining dependency limitations.
- [x] 5.3. Final review: confirm documentation, verification results, and known limitations.

### Step 5.2 acceptance criteria

- Build and type-check the application before starting the browser-test preview server.
- Run the existing Chromium, Firefox, and WebKit suite against the fresh production build.
- Do not reuse an existing server that could serve stale or development assets.
- Keep the specification aligned with implemented playback and track behavior.
- Review compatible dependency fixes; document advisories that require upstream changes.
- Preserve application behavior and verify unit tests, linting, formatting, and browser tests.

### Step 5.3 acceptance criteria

- Document setup, repeatable release checks, static build output, and runtime requirements.
- Keep the project guide consistent with application, store, and clock responsibilities.
- Make simulation assumptions and outstanding product confirmation easy to find.
- Retain the documented development-dependency advisories as a maintenance limitation.
- Confirm passing unit/component tests, production-build browser tests, type checking,
  linting, formatting, and production dependency audit results.

The condition-speed relationship and coefficients are deliberate product decisions,
with their rationale and outstanding confirmation recorded in docs/SPEC.md.
