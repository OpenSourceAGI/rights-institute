# PROSPER License  ·  `@rights/prosper-license`

The PROSPER license. The package holds its type definitions, customization logic, data loader and sample license data, plus the rendered license page used by `/prosper` and `/prosper/[...slug]`.

Part of the [Rights Institute](../../README.md) monorepo.

## Usage

The package is private to this workspace. Add it to an app's dependencies:

```json
"@rights/prosper-license": "workspace:*"
```

then import it:

```tsx
import PROSPERLicense from '@rights/prosper-license/PROSPER';
import { licenseTypes } from '@rights/prosper-license/license-types';
import { codecraftStudioData } from '@rights/prosper-license/sample-data/codecraft-studio';
import type { LicenseConfig } from '@rights/prosper-license/prosper-license-types';

<PROSPERLicense sampleSlug="codecraft-studio" />
```

## Contents

| File | What it holds |
|---|---|
| `PROSPER.tsx` | The rendered license page (`sampleSlug` prop picks the sample data) |
| `prosper-license-types.ts` | License data types (`LicenseConfig`, `LicenseData`, …) |
| `customize-license.ts` | Defaults and config for customizing a license |
| `license-data-loader.ts` | `loadLicenseData()`, `loadLicenseDataSync()`, `getAvailableLicenses()`, `validateLicenseData()` |
| `license-types.ts` | The catalogue of license types and sample licenses |
| `sample-data/` | Sample license data (`codecraft-studio`) |

## Dependencies

- Runtime: `grab-api.js`, `lucide-react`
- Peer: `next`, `react`, `react-dom`

## Requirements from the host app

This package ships TypeScript/TSX source (no build step) and is consumed by
[`apps/rights-web`](../../apps/rights-web). It imports the site's shared code
through the host app's `@/` aliases, so a host must provide:

- `@/components/ui/*`: shadcn/ui primitives (`badge`, `button`, `card`, `dialog`, `separator`, `tooltip`).
- `next`, a peer dependency, for `next/navigation`.

In `apps/rights-web` these come from the `paths` in `tsconfig.json` and the
aliases in `vite.config.ts` / `vitest.config.ts`. They also map `@rights/prosper-license` to this package's `src/` (the package
list lives in `workspace-packages.ts`), and `app/globals.css` points Tailwind's
`@source` at `packages/`.

## Tests

The `*.test.ts` files in `src/` are run by the host app's Vitest config (jsdom, `vitest.setup.ts`), since
they need the same aliases:

```bash
pnpm --filter rights-web test      # or `pnpm test` from the repo root
```

## License

[PROSPER License](https://rights.institute/prosper)
