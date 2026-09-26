# Investor Rank  ·  `@rights/investor-rank`

Investor ranking for the `/investor-rank` page. It holds the VC dataset, the layer that turns the raw records into `Investor` objects, and searchable card and table views (AG Grid).

Part of the [Rights Institute](../../README.md) monorepo.

## Usage

The package is private to this workspace. Add it to an app's dependencies:

```json
"@rights/investor-rank": "workspace:*"
```

then import it:

```tsx
import { InvestorList } from '@rights/investor-rank';
import { investors, transformInvestorData } from '@rights/investor-rank/investorData';
import type { Investor } from '@rights/investor-rank/types';
```

## Contents

| File | What it holds |
|---|---|
| `InvestorList.tsx` | Page component: search plus card/table toggle |
| `InvestorCard.tsx` | Card view of one investor |
| `InvestorTable.tsx` | AG Grid table view |
| `SearchBar.tsx` | Search input |
| `investorData.ts` | `transformInvestorData()` and the transformed `investors` list |
| `types.ts` | `Investor` and `RawInvestorData` |
| `vc-rank.json` | Raw VC dataset |
| `index.ts` | Barrel: `InvestorList` |

## Dependencies

- Runtime: `ag-grid-community`, `ag-grid-react`, `lucide-react`, `react-icons`
- Peer: `react`, `react-dom`

It has no imports from the host app. It ships TypeScript/TSX source, so the consuming bundler must compile it: `apps/rights-web` maps `@rights/investor-rank` to `src/` in `tsconfig.json`, `vite.config.ts` and `vitest.config.ts`, and lists it in `next.config.js` → `transpilePackages`.

## Tests

`src/SearchBar.test.tsx` and `src/investorData.test.ts` are run by the host app's Vitest config (jsdom, `vitest.setup.ts`), since
they need the same aliases:

```bash
pnpm --filter rights-web test      # or `pnpm test` from the repo root
```

## License

[PROSPER License](https://rights.institute/prosper)
