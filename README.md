# Horse Racing

A horse racing simulator built with Vue 3, TypeScript, and Pinia.

[Open the live app](https://horse-racing-nine-mu.vercel.app/)

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

`npm run test:unit` starts watch mode. Playwright builds the application and starts
its own production preview server on port 4173. Keep that port available; tests
do not reuse an existing server, so they always exercise a fresh build.

## Verification

Run the release checks from the project root:

```sh
npm run lint
npm run format:check
npm run test:unit -- --run
npm run test:e2e
npm audit --omit=dev
```

The browser command includes type checking and the production build. Tests cover
generation, race completion, pause/resume, round transitions, keyboard navigation,
narrow layouts, and reduced motion across Chromium, Firefox, and WebKit.
Domain tests use controlled random draws to verify ranking, ties, and upsets.

## Simulation decisions

Higher condition improves expected speed, while independent randomness allows
lower-condition horses to win. Each horse keeps a constant speed within a round;
there is no acceleration, overtaking, or fatigue. The eight-second playback scales
the viewing duration without changing simulated finish times or ranking.
The [specification](docs/SPEC.md#simulation-model) records the formula and the
condition interpretation that remains open to product confirmation.

## Production build

`npm run build` produces static assets in `dist/`. Serve that directory from a
static host at the domain root. The app requires no backend, environment variables,
or persisted storage. For a local check, run `npm run preview` after building.

The application is hosted on Vercel, connected to `ilkeradgzl/horse-racing` on
GitHub. Pushes to `main` trigger production deployments using the Vite preset,
`npm run build`, and the `dist/` output directory. Run the verification commands
before pushing; deployment builds do not run the test suite.

After deployment, check schedule generation, Start/Pause/Resume, all six rounds
and their results, and the narrow-screen layout on the live URL.

## Project guide

- `src/main.ts`: creates the Vue app, registers Pinia, and mounts `App.vue`.
- `src/App.vue`: application layout, race controls, status, and playback integration.
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
- `src/composables/__tests__/`: playback timing and cleanup tests.
- `src/stores/__tests__/`: shared lifecycle and state-transition tests.
- `e2e/`: Playwright browser tests.
- [Specification](docs/SPEC.md): requirements, decisions, and open questions.
- [Plan](docs/PLAN.md): milestone scope and progress.
- [Agent instructions](AGENTS.md): repository working conventions.

## Dependency maintenance

Run `npm audit` to review dependency advisories and `npm audit --omit=dev` to
check production dependencies separately. Review dependency updates for
compatibility before applying them.

Known development-tool advisories affect transitive `glob` and `minimatch`
dependencies used by Vue Test Utils and TypeScript ESLint. Their upstream version
ranges currently exclude the patched releases. Keep these findings visible in
dependency reviews and adopt compatible fixes when available.
