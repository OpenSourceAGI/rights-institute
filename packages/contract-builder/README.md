# Contract Builder  ·  `@rights/contract-builder`

Contract generator for the site's `/contract` page. It covers contractor, employment, NDA and co-founder agreements, with a live preview and signature capture.

Part of the [Rights Institute](../../README.md) monorepo.

## Usage

The package is private to this workspace. Add it to an app's dependencies:

```json
"@rights/contract-builder": "workspace:*"
```

then import it:

```tsx
import ContractBuilder from '@rights/contract-builder/ContractBuilder';
import EmploymentAgreementEditor from '@rights/contract-builder/EmployeeAgreement';
import CoFoundersForm from '@rights/contract-builder/CoFoundersForm';
import type { ContractData } from '@rights/contract-builder/contract';
```

## Contents

| File | What it holds |
|---|---|
| `ContractBuilder.tsx` | Multi-step contractor agreement builder (type selector, forms, preview) |
| `EmployeeAgreement.tsx` | Tabbed employment agreement editor with preview |
| `CoFoundersForm.tsx` | Co-founder equity, vesting and funding-threshold form |
| `BasicInfoForm.tsx`, `ServicesForm.tsx`, `PaymentForm.tsx`, `LegalTermsForm.tsx`, `NDAForm.tsx`, `DisputeResolutionForm.tsx`, `ContractorStatusForm.tsx`, `EmployeeForm.tsx` | The individual form steps |
| `ContractPreview.tsx`, `EmployeePreview.tsx` | Rendered agreement previews |
| `SignatureForm.tsx`, `SignaturePad.tsx` | Canvas signature capture |
| `ContractTypeSelector.tsx` | Agreement type picker |
| `contract.ts` | `ContractData`, `CoFounderData` and related types |
| `DisputeResolution.md` | Reference text for the dispute-resolution clause |

## Dependencies

- Runtime: `lucide-react`
- Peer: `react`, `react-dom`

## Requirements from the host app

This package ships TypeScript/TSX source (no build step) and is consumed by
[`apps/rights-web`](../../apps/rights-web). It imports the site's shared code
through the host app's `@/` aliases, so a host must provide:

- `@/components/ui/*`: shadcn/ui primitives (`badge`, `button`, `card`, `checkbox`, `input`, `label`, `radio-group`, `tabs`, `textarea`).

In `apps/rights-web` these come from the `paths` in `tsconfig.json` and the
aliases in `vite.config.ts` / `vitest.config.ts`. They also map `@rights/contract-builder` to this package's `src/` (the package
list lives in `workspace-packages.ts`), and `app/globals.css` points Tailwind's
`@source` at `packages/`.

## Tests

`src/contract-forms.test.tsx` are run by the host app's Vitest config (jsdom, `vitest.setup.ts`), since
they need the same aliases:

```bash
pnpm --filter rights-web test      # or `pnpm test` from the repo root
```

## License

[PROSPER License](https://rights.institute/prosper)
