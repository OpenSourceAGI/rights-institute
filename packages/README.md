# Workspace packages

Standalone packages that are not part of the site app. The site and all of its
feature modules live in [`apps/rights-web`](../apps/rights-web).

| Package | What it holds |
|---|---|
| [`@rights/prosper-coin`](./prosper-coin) | Solidity contracts for the PROSPER token and revenue sharing |

## Adding a package

1. `mkdir -p packages/<name>` and write the code.
2. Add a `package.json` modelled on a sibling: `@rights/<name>`, `private`,
   `"type": "module"`, and its own dependencies.
3. `pnpm install` from the repo root. Give it `build`/`test` scripts if it has
   any; Turborepo picks them up via `turbo.json`.
