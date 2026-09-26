# Workspace packages

Feature packages that the site in [`apps/rights-web`](../apps/rights-web)
consumes, plus standalone code that isn't part of the site. Each package has its
own `README.md` and `package.json`.

| Package | What it holds |
|---|---|
| [`@rights/contract-builder`](./contract-builder) | Contractor, employment, NDA and co-founder agreement generators |
| [`@rights/credit`](./credit) | CREDIT: the contribution-accounting model page |
| [`@rights/innovation-timeline`](./innovation-timeline) | Interactive timeline of innovation milestones |
| [`@rights/investor-rank`](./investor-rank) | VC dataset, transform layer, and searchable card/table views |
| [`@rights/prosper-license`](./prosper-license) | PROSPER license types, customization, data loader, and license page |
| [`@rights/site-shell`](./site-shell) | Top nav, hero, footer, document navigation, docs MDX components |
| [`@rights/startup-tools`](./startup-tools) | Categorized directory of startup tools |
| [`@rights/prosper-coin`](./prosper-coin) | Solidity contracts for the PROSPER token and revenue sharing |

## How the site consumes them

The TypeScript packages ship source with no build step. `apps/rights-web`
depends on each as `"@rights/<name>": "workspace:*"` and imports
`@rights/<name>/<file>`, or `@rights/<name>` where the package has an
`index.ts` barrel. To make that work, the app:

- lists the packages in `workspace-packages.ts`, which builds the
  `@rights/*` aliases for `vite.config.ts` and `vitest.config.ts`;
- maps the same paths in `tsconfig.json` and typechecks `packages/*/src`;
- runs the packages' `*.test.ts(x)` files in its own Vitest run;
- adds them to `transpilePackages` in `next.config.js`;
- points Tailwind at `packages/` with `@source` in `app/globals.css`.

The packages may import the app's shared code through its `@/components/ui/*`
and `@/lib/*` aliases; each package's README lists what it needs.

## Adding a package

1. `mkdir -p packages/<name>/src` and write the code.
2. Add a `package.json` modelled on a sibling: `@rights/<name>`, `private`,
   `"type": "module"`, `exports`, and its own dependencies, plus a `README.md`.
3. If the site uses it, add it to `apps/rights-web/package.json`,
   `workspace-packages.ts`, `tsconfig.json` `paths`, and `transpilePackages`.
4. `pnpm install` from the repo root.
