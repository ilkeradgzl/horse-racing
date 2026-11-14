# Implementation plan

## Milestones

- [x] 1. Application foundation: Vue, TypeScript, Pinia, development tooling, and documentation.
- [ ] 2. Horse and schedule generation: domain rules, focused unit tests, and a minimal inspection interface.
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

## Next milestone: horse and schedule generation

- Define when horses are generated and how schedule regeneration behaves.
- Implement horse generation and six-round scheduling as framework-independent rules.
- Verify horse count, unique colors, condition boundaries, round distances, and
  participant uniqueness with deterministic tests.
- Provide a minimal interface for inspecting generated data.

Condition/performance modeling belongs to race execution. Resolve pause/resume
before implementing race controls, and visual direction before interface styling.
