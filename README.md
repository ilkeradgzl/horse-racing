# Horse Racing

A horse racing simulator built with Vue 3, TypeScript, and Pinia.

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
- `src/App.vue`: root application component.
- `src/domain/horse.ts`: horse model and framework-independent roster generation.
- `src/domain/schedule.ts`: round model and six-round schedule generation.
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
