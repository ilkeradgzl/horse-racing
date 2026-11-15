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
- Disable schedule generation while running or paused; the store also ignores
  generation calls in those states. After completion, generating a new schedule clears race
  progress and results while preserving the roster.

## Simulation model

### Product interpretation and confirmation

The defined condition range is 1 to 100; its effect on racing performance is
unspecified. The selected product interpretation is that higher condition improves
expected speed, while independent round-level randomness permits upsets. This is
a deliberate product decision, not an explicit requirement or a physiological model.

Confirm whether condition is intended to affect speed and whether the selected
advantage is appropriate. Until that interpretation changes, use the model below.

### Speed and outcome rules

For each participant, draw an independent uniform random value `u` in `[0, 1)`
once at the start of each round:

```text
speed = 12 + 4 * (condition / 100) + 5 * u
```

- Speed is measured in simulated meters per second and remains constant for the round.
- Draw again in each new round; horse condition remains unchanged.
- The baseline of 12 controls simulated durations and relative visual separation.
  It does not affect finishing order. It is a tuning value, not a measured constant.
- The condition coefficient of 4 gives higher-condition horses a consistent advantage.
- The random range of 5 exceeds the largest condition contribution difference,
  `4 * (100 - 1) / 100 = 3.96`. Therefore no horse is mathematically excluded
  from winning solely because of its condition, including against a full field.
- This guarantees possibility, not frequent upsets. Winning against nine opponents
  is less likely than beating one; no fixed full-field win probability is promised.
- Constant speeds mean there is no overtaking after the start. Pace variation,
  acceleration, and fatigue are outside this initial model.

For a higher/lower-condition pair with condition difference `d`, the lower-condition
horse's head-to-head win probability under independent uniform draws is:

```text
P(upset) = 0.5 * (1 - (4 * d / 100) / 5)^2
```

Examples: condition 10 beats condition 90 with probability 6.48%; condition 1
beats condition 100 with probability 2.1632%. Equal conditions have equal chances.
These are mathematical pairwise probabilities, not empirical measurements or
probabilities of winning a ten-horse round. The coefficients express a chosen
balance between favorites and upsets; there is no unique optimal balance without
a target win rate or gameplay feedback.

Calculate progress and results from elapsed simulation time:

```text
distanceTravelled = min(roundDistance, speed * elapsedSeconds)
finishTime = roundDistance / speed
```

- Clamp progress at the finish line and order results by unrounded finish time.
- Break exact ties using the original participant order.
- A round completes when all 10 participants have finished.
- Keep simulation time separate from animation playback speed; the playback rules
  below define presentation timing. Animation frame rate must not affect results.

### Domain API

- `createRoundSimulation(round, horses, random?)` captures participant IDs, sampled
  speeds, and unrounded finish times in starting order. It does not retain horse
  objects or the mutable schedule. Randomness defaults to Math.random.
- Require a finite positive distance, 10 distinct participants present in a roster
  with unique IDs, and integer participant conditions from 1 to 100. Invalid
  inputs are rejected before sampling speeds.
- `getRoundProgress(simulation, elapsedSeconds)` returns distances, per-horse
  finish status, round completion, and results. Results remain empty until the
  whole round completes; completed results include horse ID, position, and
  unrounded finish time in simulation seconds.
- Elapsed time is total simulation seconds since the round started, not a frame
  delta. Require finite, non-negative input; identical inputs yield identical
  progress regardless of earlier reads.
- A horse finishes when elapsed time reaches its calculated finish time; set its
  distance exactly to the finish line to avoid floating-point crossing ambiguity.
- Keep timers, Pinia lifecycle, controls, and animations outside the domain API.

## Race lifecycle

- States: `idle` before generation, `ready` after generation, `running` after Start,
  `paused` while suspended, and `completed` after all six rounds finish.
- `startRace()` starts only a ready schedule. Calls before generation, during
  execution, or after completion have no effect. A completed schedule requires a
  new Generate action before it can start again.
- Keep one active round snapshot, its elapsed simulation seconds, and completed
  round results. Sample participant speeds only when a round starts.
- `advanceRace(deltaSeconds)` accepts finite, non-negative simulation seconds since
  the last update. Valid updates outside the running state have no effect;
  invalid deltas are rejected without changing state.
- Finish each round when its slowest horse crosses the line, record its results
  once, and start the next round immediately. No inter-round delay is included.
- Carry unused time from an update into the next round, including across several
  rounds. No simulation time is lost when a clock update arrives late.
- Preserve completed results in schedule order. After the sixth round, retain its
  final snapshot and finish-line progress; discard time beyond program completion.
- Pause is allowed only while running; Resume is allowed only while paused.
  Repeated or invalid calls have no effect. Pausing preserves sampled speeds,
  elapsed time, completed results, and the schedule; time updates are ignored
  until Resume.
- Transitions between rounds are immediate, so Pause applies to whichever round
  is active when the action is processed.
- The lifecycle owns no timers. A presentation composable supplies time updates.

## Controls, playback, and result display

- Show Generate schedule and Start initially; Start is disabled until a schedule is ready.
- Label the race control Pause while running and Resume while paused. Keep the
  same button mounted to preserve keyboard focus when its action changes.
  Generate remains disabled in both states. After completion, Start is disabled
  until another schedule is generated.
- Display current round status and elapsed simulation seconds. Announce lifecycle
  and round changes, without announcing elapsed time on every frame.
- Each round plays in approximately eight real seconds, excluding pauses. Convert
  real elapsed time to simulation time using the active round's total duration.
  This is a selected presentation rule, not a change to horse performance or
  simulated finish times; longer distances use a higher playback scale.
- Use requestAnimationFrame timestamps. The first frame establishes the time
  baseline; Resume starts a fresh baseline and excludes paused time.
- If a delayed frame crosses a round boundary, consume only the real time needed
  to finish it, then apply the remaining real time using the next round's scale.
  A late update can complete several rounds in schedule order.
- A running race catches up after a background-tab delay; it does not automatically
  pause. Cancel pending frames on Pause, completion, or component disposal.
- Show each completed round's results in a semantic table with position, horse
  name, and simulated finish time in seconds to two decimal places. Ranking uses
  unrounded values; identical displayed times can have different positions.
- Keep completed results visible while later rounds run. Generating a new schedule
  clears them.

## Animated track

- Keep the green and neutral visual style. The reference design guides functionality,
  without requiring a matching dashboard arrangement.
- Preview the first scheduled round at the starting line after generation. Show an
  empty track state before a schedule exists.
- Display 10 lanes in participant order, with lane number, horse name, unique
  horse color, distance traveled, and a visible finish line.
- Drive horizontal horse positions directly from simulation progress as a fraction
  of round distance. The track owns no timer or additional race state.
- Keep markers within the course, freeze positions while paused, switch to the new
  participants when rounds advance, and retain the last round at the finish line.
- Use scalable inline SVG horse indicators and responsive course widths without
  image dependencies or horizontal page scrolling.
- Expose each horse's progress through an accessible name, bounded percentage, and
  distance description. Do not announce every frame through a live region.
- Respect reduced motion by hiding the moving indicators while preserving visible
  distances, accessible progress values, and race results.

## Responsive layout and navigation

- Keep race controls visible in a sticky header while scrolling.
- Provide a visible-on-focus skip link to the race status heading, including before
  generation when the workspace contains its empty state. It navigates content;
  it does not skip a race round.
- Use a native anchor to a focusable heading, with CSS scroll margin to clear the
  sticky header. Preserve native link behavior: Enter or a pointer click activates
  it; Space scrolls the page. No custom scrolling or keyboard handlers are needed.
- Repeated activation must return to the same heading without drifting down the
  page. Support keyboard and pointer activation in short viewports.
- Prioritize race status and track in document order. On narrow screens, place
  results and the schedule next, followed by the supporting horse roster.
- On wide screens, place the roster beside the race workspace and the results
  and schedule below. Preserve a consistent results-before-schedule reading order.
- Use three round cards per row on wide screens, two on tablets, and one on phones.
  Keep table contents readable without horizontal page scrolling at 320px.
- Retain all six rounds and every participant; presentation must not hide or truncate data.

## Technical approach

- Vue 3, TypeScript, Vite, and Pinia.
- Composition API and `<script setup lang="ts">` components.
- Framework-independent business logic and shared game state managed by Pinia.
- Vitest and Vue Test Utils for unit and component tests; Playwright for browser tests.
- ESLint, Prettier, and strict TypeScript for code quality.
- Clear, maintainable components and modules with abstractions introduced as needed.

## Product decisions pending

Resolve each decision before implementing the affected behavior.

- Confirm the selected interpretation of condition as a speed advantage and the
  intended balance between condition and randomness; see the simulation model.

## Outside current scope

Reset, fatigue, replay, persistence, authentication, additional race modes,
a backend, routing, and a UI framework require a separate scope decision.
