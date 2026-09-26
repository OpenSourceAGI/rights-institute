# @/lib/db

Drizzle ORM schema (`schema.ts`) and the lazily-built libSQL/Turso client
(`index.ts`), shared by `@/lib/auth` and the route handlers in `app/api`.

Two migration sets live here, both carried over from `packages/db`:

- `drizzle/` — what `drizzle-kit` writes today (`out` in the app's
  `drizzle.config.ts`), and the newer of the two.
- `migrations/` — the older set.

They describe the same tables under different journal tags. Nothing imports
either directory at runtime, so both were carried over as-is rather than
picking a winner; consolidating them is a separate call.
