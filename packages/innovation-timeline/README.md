# Innovation Timeline  ·  `@rights/innovation-timeline`

Interactive, searchable timeline of innovation milestones, rendered at `/timeline`.

Part of the [Rights Institute](../../README.md) monorepo.

## Usage

The package is private to this workspace. Add it to an app's dependencies:

```json
"@rights/innovation-timeline": "workspace:*"
```

then import it:

```tsx
import { TimelineMain } from '@rights/innovation-timeline';
// or
import TimelineMain from '@rights/innovation-timeline/TimelineMain';
```

## Contents

| File | What it holds |
|---|---|
| `TimelineMain.tsx` | The timeline page: search, category tabs and the timeline (default export) |
| `timeline.tsx` | Generic `Timeline` component with the `TimelineItem` and `TimelineProps` types |
| `innovations.json` | Milestone data |
| `index.ts` | Barrel: `TimelineMain` |

## Dependencies

- Runtime: `lucide-react`, `react-icons`
- Peer: `react`, `react-dom`

## Requirements from the host app

This package ships TypeScript/TSX source (no build step) and is consumed by
[`apps/rights-web`](../../apps/rights-web). It imports the site's shared code
through the host app's `@/` aliases, so a host must provide:

- `@/components/ui/*`: shadcn/ui primitives (`badge`, `button`, `card`, `input`, `separator`, `tabs`) and `utils` (`cn()`).

In `apps/rights-web` these come from the `paths` in `tsconfig.json` and the
aliases in `vite.config.ts` / `vitest.config.ts`. They also map `@rights/innovation-timeline` to this package's `src/` (the package
list lives in `workspace-packages.ts`), and `app/globals.css` points Tailwind's
`@source` at `packages/`.

## License

[PROSPER License](https://rights.institute/prosper)
