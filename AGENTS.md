# Repository instructions

## Stack and architecture

- Use Vue 3, TypeScript, Vite, and Pinia with strict TypeScript.
- Write Vue SFCs with Composition API and `<script setup lang="ts">`.
- Keep components cohesive and business rules in framework-independent TypeScript.
- Use Pinia for shared game state; keep local UI state local.
- Introduce composables for meaningful reactive behavior or reuse.
- Add folders, dependencies, and abstractions only when required by the current scope.

## Quality

- Test meaningful behavior with Vitest, Vue Test Utils, and Playwright.
- Keep randomized business logic deterministic in tests where appropriate.
- Consider accessibility, responsive layout, and animation cleanup.
- Run relevant tests, type checking, linting, formatting checks, and builds.
- Include verification results and known limitations in change summaries.
- Keep documentation accurate, portable, and focused on product behavior and maintenance.

## Workflow

- Read docs/SPEC.md and docs/PLAN.md before feature work.
- Separate requirements, proposed decisions, and unresolved questions.
- Keep changes scoped to one approved milestone and review them before proceeding.
- Update the README and milestone progress when relevant behavior or tooling changes.
- Review diffs and use scoped Conventional Commit messages.
- Do not commit, push, or rewrite Git history without explicit approval.
