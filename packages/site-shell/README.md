# Site Shell  ·  `@rights/site-shell`

Site chrome shared across routes: the top navigation, hero banner, footer, document navigation and the docs MDX components.

Part of the [Rights Institute](../../README.md) monorepo.

## Usage

The package is private to this workspace. Add it to an app's dependencies:

```json
"@rights/site-shell": "workspace:*"
```

then import it:

```tsx
import { TopNav } from '@rights/site-shell/TopNav';
import Footer from '@rights/site-shell/Footer';
import DocumentNavigation from '@rights/site-shell/DocumentNavigation';
import { getMDXComponents } from '@rights/site-shell/mdx-components';
import { SITE_CATEGORIES, SITE_LINKS } from '@rights/site-shell/site-nav';
```

## Contents

| File | What it holds |
|---|---|
| `TopNav.tsx` | Top navigation bar with document menus and sign-in (`TopNav`, `TOP_NAV_HEIGHT_CLASS`, `TOP_NAV_Z_CLASS`) |
| `DocumentNavigation.tsx` | Home-page document grid |
| `Footer.tsx` | Site footer |
| `HeroBanner.tsx`, `DocsBadges.tsx` | Docs landing-page hero and badges |
| `mdx-components.tsx` | `getMDXComponents()` for Fumadocs pages |
| `site-nav.ts` | The site's document categories and links, the one source for all navigation |

## Dependencies

- Runtime: `fumadocs-ui`, `lucide-react`
- Peer: `next`, `react`, `react-dom`

## Requirements from the host app

This package ships TypeScript/TSX source (no build step) and is consumed by
[`apps/rights-web`](../../apps/rights-web). It imports the site's shared code
through the host app's `@/` aliases, so a host must provide:

- `@/components/ui/*`: `navigation-menu` and `utils` (`cn()`).
- `@/lib/auth/*`: `AuthButton` and `auth-client` (`useSession`, `signIn`).
- `next`, a peer dependency, for `next/link` and `next/navigation`.

In `apps/rights-web` these come from the `paths` in `tsconfig.json` and the
aliases in `vite.config.ts` / `vitest.config.ts`. They also map `@rights/site-shell` to this package's `src/` (the package
list lives in `workspace-packages.ts`), and `app/globals.css` points Tailwind's
`@source` at `packages/`.

## Tests

`src/TopNav.test.tsx` and `src/DocumentNavigation.test.tsx` are run by the host app's Vitest config (jsdom, `vitest.setup.ts`), since
they need the same aliases:

```bash
pnpm --filter rights-web test      # or `pnpm test` from the repo root
```

## License

[PROSPER License](https://rights.institute/prosper)
