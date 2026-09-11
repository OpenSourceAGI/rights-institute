/**
 * Auth configuration read at *request* time.
 *
 * Deliberately free of heavy imports (better-auth, drizzle, resend) so that
 * route handlers can ask "is auth configured?" without importing — and
 * therefore without risking a crash in — the auth instance itself.
 *
 * Everything here goes through getEnv()/getBinding(), which prefer the
 * Cloudflare Worker runtime env over build-time process.env: on Workers these
 * values are commonly set as runtime vars/secrets (`wrangler secret put NAME`,
 * or the Worker's dashboard settings), so reading them at request time means a
 * rotated secret takes effect without a rebuild.
 */
import { getBinding, getEnv } from '@rights/env';

export const PROD_URL = 'https://rights.institute';

/** Hostnames this deployment is known to answer on, beyond whatever the env says. */
export const KNOWN_ORIGINS = [
  PROD_URL,
  'https://www.rights.institute',
  'http://localhost:3000',
  'http://localhost:9000',
] as const;

/** The Worker binding the D1 database is attached to — see wrangler.jsonc. */
export const D1_BINDING = 'DB';

/**
 * Configuration auth *should* have but survives without.
 *
 * BETTER_AUTH_SECRET is in this list rather than the required one on purpose:
 * better-auth falls back to its own development secret when none is set, so a
 * deployment missing it can still sign users in. It is reported by
 * /api/health and logged loudly at startup, because running on the fallback
 * means cookie signatures are not secret to this deployment — set it.
 */
export const RECOMMENDED_AUTH_ENV = ['BETTER_AUTH_SECRET'] as const;

export class AuthConfigError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(
      `Auth is not configured — missing ${missing.join(', ')}. ` +
        'The database normally arrives as the `DB` D1 binding declared in ' +
        'wrangler.jsonc; outside Workers set TURSO_DATABASE_URL in .env. ' +
        'Other values can be set with `wrangler secret put <NAME>` (or the ' +
        'Worker’s dashboard settings); they are read per request, so no ' +
        'rebuild is needed. See content/docs/environment-variables.mdx.'
    );
    this.name = 'AuthConfigError';
    this.missing = missing;
  }
}

/** True when a database is reachable — the D1 binding, or a libSQL URL. */
export function hasDatabase(): boolean {
  return Boolean(getBinding(D1_BINDING)) || Boolean(getEnv('TURSO_DATABASE_URL'));
}

/**
 * What auth genuinely cannot start without.
 *
 * Only the database qualifies. Everything else degrades: no Google
 * credentials disables Google sign-in and the One Tap prompt, no Resend key
 * disables magic-link delivery, no BETTER_AUTH_SECRET falls back to
 * better-auth's own secret. Gating the whole flow on more than this is what
 * turned a half-configured deployment into `POST /api/auth/sign-in/social
 * 503` for every visitor.
 */
export function missingAuthEnv(): string[] {
  return hasDatabase() ? [] : [`${D1_BINDING} (D1 binding) or TURSO_DATABASE_URL`];
}

/** Recommended-but-absent configuration. Names only; never values. */
export function authWarnings(): string[] {
  return RECOMMENDED_AUTH_ENV.filter((key) => !getEnv(key));
}

export function isAuthConfigured(): boolean {
  return missingAuthEnv().length === 0;
}

/**
 * The secret better-auth signs cookies and OAuth state with.
 *
 * `undefined` is passed through rather than substituted: better-auth then
 * applies its own fallback and logs about it, which keeps a deployment
 * signing users in instead of failing closed.
 */
export function authSecret(): string | undefined {
  return getEnv('BETTER_AUTH_SECRET') || getEnv('AUTH_SECRET') || undefined;
}

/**
 * The Google OAuth client ID.
 *
 * Public by design — it ships to the browser so Google One Tap can initialize —
 * so unlike the secret it is safe to serve from an API route. Falls back to a
 * `NEXT_PUBLIC_` copy for deployments that prefer build-time inlining.
 */
export function googleClientId(): string {
  return getEnv('GOOGLE_CLIENT_ID') || getEnv('NEXT_PUBLIC_GOOGLE_CLIENT_ID') || '';
}

/** Google OAuth credentials, or null when either half is absent. */
export function googleCredentials(): { clientId: string; clientSecret: string } | null {
  const clientId = googleClientId();
  const clientSecret = getEnv('GOOGLE_CLIENT_SECRET');
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

/**
 * The base URL better-auth builds absolute URLs from — most importantly the
 * Google `redirect_uri`, `${baseURL}/api/auth/callback/google`.
 *
 * Returning `undefined` is meaningful and is the normal case in production:
 * better-auth then derives the origin from the incoming request, which is the
 * only correct answer on Cloudflare Workers, where one deploy answers on
 * rights.institute, www.rights.institute and *.workers.dev preview URLs alike.
 *
 * This used to fall back to `NODE_ENV === 'production' ? PROD_URL : localhost`.
 * That guess is unsafe here: `getEnv('NODE_ENV')` reads `process.env` through a
 * computed key, which no bundler can inline, and Workers do not set NODE_ENV in
 * the runtime env — so the check read `undefined` in production and pinned the
 * base URL to `http://localhost:3000`. Every Google sign-in then asked for a
 * localhost `redirect_uri` and was rejected as a redirect_uri_mismatch.
 */
export function authBaseURL(): string | undefined {
  const explicit = getEnv('BETTER_AUTH_URL') || getEnv('NEXT_PUBLIC_APP_URL');
  if (explicit) return explicit;

  // Only an *explicit* dev/test signal justifies assuming localhost.
  const nodeEnv = getEnv('NODE_ENV');
  if (nodeEnv === 'development' || nodeEnv === 'test') return 'http://localhost:3000';

  return undefined;
}

/** The origin a request was actually addressed to, or undefined if unparseable. */
function originOfRequest(request?: Request): string | undefined {
  if (!request?.url) return undefined;
  try {
    return new URL(request.url).origin;
  } catch {
    return undefined;
  }
}

/**
 * Origins better-auth accepts sign-in requests and post-login redirects from.
 *
 * The request's own origin is included when one is given. A static list can
 * only ever name hosts known at build time, so any other one — a *.workers.dev
 * deploy, a preview URL, a dev server on a port other than 3000 — had its
 * `POST /api/auth/sign-in/social` rejected with a 403 by better-auth's origin
 * check. Echoing the request's own origin does not weaken CSRF protection: a
 * cross-site request carries the attacker's `Origin` header, never this host's,
 * so it still fails.
 */
export function trustedOrigins(request?: Request): string[] {
  const origins = new Set<string>(KNOWN_ORIGINS);

  for (const value of [getEnv('BETTER_AUTH_URL'), getEnv('NEXT_PUBLIC_APP_URL')]) {
    if (!value) continue;
    try {
      origins.add(new URL(value).origin);
    } catch {
      // A malformed URL in the env shouldn't take auth down; the known
      // origins above still apply.
    }
  }

  const self = originOfRequest(request);
  if (self) origins.add(self);

  return [...origins];
}
