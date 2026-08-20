<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->

## WPP UI Quick Start

- Stack: Nx 22 + Angular 21 single-application workspace; package manager is npm.
- Use `npx nx` for local Nx commands to avoid global CLI drift.
- The workspace contains one project: `wpp-ui` (application, rooted at the repository root).

## High-Value Commands

- Install dependencies: `npm install`
- List projects: `npx nx show projects --json`
- Serve the app: `npx nx serve wpp-ui`
- Build the app: `npx nx build wpp-ui`
- Test the app: `npx nx test wpp-ui`
- Test in watch mode: `npx nx test wpp-ui --configuration=watch`
- Lint the app: `npx nx lint wpp-ui`
- Fix lint violations: `npx nx lint wpp-ui --configuration=fix`
- Format the workspace: `npx nx format:write`

## Application Styling

- Follow nearby WPP components for class naming, component structure, and token usage.
- Keep application-owned classes in kebab case and update templates, styles, TypeScript references, and tests together when renaming them.
- Do not rename third-party framework classes or classes supplied by external content solely to match application conventions.

## Testing Expectations

- Unit tests use `@angular/build:unit-test` with coverage enabled by default.
- Coverage thresholds are enforced at 85% for branches, functions, lines, and statements.
- Prefer Testing Library APIs (`@testing-library/angular` and `@testing-library/dom`) over direct DOM access.
- Prefer `user-event` for interactions and `@testing-library/jest-dom` matchers for rendered DOM assertions.
- Import `@testing-library/jest-dom/vitest` in `src/test-setup.ts`, not in individual `*.spec.ts` files.
- Avoid low-level patterns such as `querySelector`, `querySelectorAll`, manual `dispatchEvent`, and raw `element.click()` when a Testing Library equivalent exists.

## Documentation Map

- Repository overview: [README.md](README.md)
- Application configuration and targets: [project.json](project.json)
- Workspace defaults and generator settings: [nx.json](nx.json)

## Documentation Expectations

- Add concise JSDoc when it clarifies intent, contracts, or edge cases, including for non-exported helpers where useful.
- Place JSDoc for Angular classes immediately before the class declaration, not between the decorator and class.
- Use `@param`, `@returns`, `@throws`, `@see`, `@deprecated`, and inline links when they improve the documentation.

## Agent Pitfalls

- Use nearby code as the primary guide for naming, structure, patterns, and APIs when generating code.
- After generating code, run `npx nx format:write` so generated files follow workspace formatting conventions.
- Use `npx nx show project <name> --json` for non-interactive resolved project configuration.
- Do not edit generated artifacts under `coverage/` or `dist/` unless explicitly requested.
