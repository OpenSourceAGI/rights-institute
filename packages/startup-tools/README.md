# Startup Tools  ·  `@rights/startup-tools`

Categorized, filterable directory of startup tools, rendered at `/startup-tools`.

Part of the [Rights Institute](../../README.md) monorepo.

## Usage

The package is private to this workspace. Add it to an app's dependencies:

```json
"@rights/startup-tools": "workspace:*"
```

then import it:

```tsx
import { StartupTools } from '@rights/startup-tools';
import { tools, categories } from '@rights/startup-tools/tools';
import type { Tool, Category } from '@rights/startup-tools/tool';
```

## Contents

| File | What it holds |
|---|---|
| `StartupTools.tsx` | Page component (default export) |
| `ToolGrid.tsx`, `ToolCard.tsx` | Tool listing |
| `CategoryFilter.tsx` | Category filter |
| `Navbar.tsx` | Directory header |
| `tools.ts` | The `tools` and `categories` data |
| `tool.ts` | `Tool` and `Category` types |
| `index.ts` | Barrel: `StartupTools` |

## Dependencies

- Runtime: `lucide-react`
- Peer: `react`, `react-dom`

It has no imports from the host app. It ships TypeScript/TSX source, so the consuming bundler must compile it: `apps/rights-web` maps `@rights/startup-tools` to `src/` in `tsconfig.json`, `vite.config.ts` and `vitest.config.ts`, and lists it in `next.config.js` → `transpilePackages`.

## Tests

`src/ToolGrid.test.tsx` and `src/tools.test.ts` are run by the host app's Vitest config (jsdom, `vitest.setup.ts`), since
they need the same aliases:

```bash
pnpm --filter rights-web test      # or `pnpm test` from the repo root
```

## License

[PROSPER License](https://rights.institute/prosper)
