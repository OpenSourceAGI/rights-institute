# CREDIT  ·  `@rights/credit`

The CREDIT contribution-accounting model page, rendered at `/credit`.

Part of the [Rights Institute](../../README.md) monorepo.

## Usage

The package is private to this workspace. Add it to an app's dependencies:

```json
"@rights/credit": "workspace:*"
```

then import it:

```tsx
import { CREDIT } from '@rights/credit';
// or
import CREDIT from '@rights/credit/CREDIT';
```

## Contents

| File | What it holds |
|---|---|
| `CREDIT.tsx` | The CREDIT page component (default export) |
| `index.ts` | Barrel: `CREDIT` |

## Dependencies

- Runtime: `lucide-react`, `react-icons`
- Peer: `react`, `react-dom`

It has no imports from the host app. It ships TypeScript/TSX source, so the consuming bundler must compile it: `apps/rights-web` maps `@rights/credit` to `src/` in `tsconfig.json`, `vite.config.ts` and `vitest.config.ts`, and lists it in `next.config.js` → `transpilePackages`.

## License

[PROSPER License](https://rights.institute/prosper)
