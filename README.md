# Horse Racing

A horse racing simulator built with Vue 3, TypeScript, and Pinia.

## Usage

The horse list shows the session's 20 horses, including their conditions and colors.
Select **Generate schedule** to create six rounds with 10 participants each.
Select **Start** to run all six rounds in sequence, approximately eight real seconds
per round. **Pause** freezes progress; **Resume** continues from the same point.
The track previews the first round after generation, then shows colored horses
moving through ten lanes. Positions freeze on Pause and reset for each new round.
Results appear after each round with simulated finish times, independently of playback speed.
Reduced-motion preferences hide moving indicators while preserving distances and results.
Controls remain visible while scrolling. On small screens, the active race appears
before results, the schedule, and the supporting roster. Keyboard users can use
**Skip to race** to focus the race workspace.

Schedule generation is disabled while running or paused. After completion,
generate another schedule to clear results and prepare a new program; the horse
list stays unchanged. Reloading the page creates a new roster.

## Setup

Use Node.js `^22.18.0 || >=24.12.0` with npm installed and available on PATH.

```sh
npm ci
npx playwright install
npm run dev
```

## Commands

| Command                      | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `npm run dev`                | Start the development server                     |
| `npm run build`              | Type-check and build for production              |
| `npm run build-only`         | Build without type checking                      |
| `npm run preview`            | Preview the production build                     |
| `npm run type-check`         | Check application, tooling, and test types       |
| `npm run lint`               | Check ESLint rules without changing files        |
| `npm run lint:fix`           | Apply available ESLint fixes                     |
| `npm run format`             | Format project files                             |
| `npm run format:check`       | Check formatting                                 |
| `npm run test:unit -- --run` | Run unit/component tests once                    |
| `npm run test:e2e`           | Run headless Chromium, Firefox, and WebKit tests |

`npm run test:unit` starts watch mode. Playwright starts its own development server.

## Project guide

- `src/main.ts`: creates the Vue app, registers Pinia, and mounts `App.vue`.
- `src/App.vue`: application layout and schedule generation control.
- `src/components/`: horse list, animated track, schedule, and completed results presentation.
- `src/components/HorseIcon.vue`: decorative SVG artwork that inherits its color from the parent.
- `src/composables/useRaceClock.ts`: scoped playback clock and round-time scaling.
- `src/stores/racing.ts`: session roster, schedule generation, race lifecycle,
  elapsed-time updates, and completed-round results.
- `src/domain/horse.ts`: horse model and framework-independent roster generation.
- `src/domain/schedule.ts`: round model and six-round schedule generation.
- `src/domain/simulation.ts`: single-round speed sampling, elapsed-time progress, and finishing results.
- `src/domain/__tests__/`: deterministic domain unit tests.
- `src/__tests__/`: component tests using Vue Test Utils and Vitest.
- `e2e/`: Playwright browser tests.
- [Specification](docs/SPEC.md): requirements, decisions, and open questions.
- [Plan](docs/PLAN.md): milestone scope and progress.
- [Agent instructions](AGENTS.md): repository working conventions.

## Dependency maintenance

Run `npm audit` to review dependency advisories and `npm audit --omit=dev` to
check production dependencies separately. Review dependency updates for
compatibility before applying them.
