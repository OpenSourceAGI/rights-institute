# Changelog

Commit counts are commits authored that month on the default branch, merge commits included. Each month is a bullet list, one bullet per change.

# MVP Phase (2026)

## September 2026

- Fixed sign-in returning **503** from every `/api/auth/*` endpoint: the route gated all of auth on `BETTER_AUTH_SECRET` **and** `TURSO_DATABASE_URL`, so a deployment missing either answered `POST /api/auth/sign-in/social` and `POST /api/auth/one-tap/callback` with `auth_unavailable` for every visitor. Only an unreachable database is a hard failure now; a missing secret falls back to better-auth's own and is reported as a warning.
- Moved the database onto the **Cloudflare D1** `DB` binding (with libSQL/Turso kept as the fallback off Workers), matching the QwkSearch app. A binding ships with the deployment, so the database can no longer go missing between deploys the way a dashboard variable can.
- Set `keep_vars: true` in `wrangler.jsonc`. Without it every `wrangler deploy` deletes plaintext Variables entered in the Cloudflare dashboard, because the config declares no `vars` of its own.
- Made better-auth's `trustedOrigins` a function of the request, adding the origin each request was addressed to — a static list can't name `*.workers.dev` or preview hosts, whose sign-in POSTs were rejected with a 403 by the CSRF origin check.
- Pointed the browser auth client at `window.location.origin`, so auth requests are same-origin on every host the app is served from.
- Added the `documents` migration that the schema had outgrown, and reported `warnings` separately from `missing` in `GET /api/health`.

## June 2026 — 19 commits

- Migrated Cloudflare deployment from **@opennextjs/cloudflare** to **Vinext**.
- Corrected **Vite** alias resolution order so specific `@/lib` and `@/components` paths resolve before the bare `@` alias.
- Migrated **Tailwind CSS** configuration to CommonJS with a dedicated PostCSS config, and removed unused **Turbopack** settings.
- Integrated the **Inter font** family with CSS support for multiple languages, and improved layout typography.
- Added the database schema and **Drizzle** migrations for messages, chats, and user management.
- Made the database client lazy-loaded and marked route files as dynamic exports.
- Extended the `build:cf` script to generate `worker.js` for **Cloudflare Workers**, and updated **pnpm workspace** build flags.
- Added a documentation link to the README.

## May 2026 — 21 commits

- Migrated to **OpenNext** for **Cloudflare Workers** deployment with `wrangler.jsonc` configuration.
- Fixed an infinite build loop by separating the Next.js build from the OpenNext build.
- Integrated **Resend** for magic-link authentication.
- Refactored **Google One Tap** sign-in, resolving build failures caused by a duplicated GoogleOneTap render.
- Added an interactive **globe visualization** component.
- Added **InvestorCard** and **InvestorList** components for investor profile data, plus session management utilities.
- Reorganized homepage document navigation into categories and appended a **CAUSE framework** summary to the Understandings page.
- Migrated brand icons from **lucide-react** to **react-icons**.
- Moved **PROSPER** contract files into a dedicated `prosper-coin` directory and removed legacy static documentation artifacts.
- Synced lockfiles to resolve peer dependency mismatches.

## March 2026 — 5 commits

- Implemented the **PROSPER token** and revenue-sharing smart contracts, with frontend components updated to match.
- Added an **auto-merge GitHub workflow** for CI automation.
- Expanded project documentation.
- Refactored the TimelineMain component import path and fixed type errors.

## February 2026 — 2 commits

- Fixed mobile UI on the homepage and innovation timeline.
- Reorganized document navigation into five thematic sections (Legal Documents, Open Source Licensing, Startup Resources, Knowledge & Exploration) with section headers and descriptions.
- Made the timeline's search, tabs, cards, and typography fully responsive with a mobile-first **Tailwind** approach.

# Prototype Phase (2025)

## December 2025 — 42 commits

- Implemented full authentication using **better-auth**: **Google OAuth** sign-in with callback handling, **magic link** login, and a dedicated login page.
- Fixed session API 404s and the missing Drizzle verification model.
- Built a custom document dashboard with templates (Contract, Terms, Ethics, PROSPER) and full CRUD API routes, backed by a **Drizzle ORM** schema on **Turso**.
- Added a sortable **AG Grid** investor rankings table with pagination and custom cell renderers.
- Optimized the **Game of Life** animated background for lower CPU and memory usage.
- Removed the header navigation bar in favor of a floating sign-in button.
- Stripped heavy canvas text effects from the Problems and Understandings pages.
