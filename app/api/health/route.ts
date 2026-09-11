export const dynamic = 'force-dynamic';

import { getEnv } from '@rights/env';
import {
  authWarnings,
  googleCredentials,
  hasDatabase,
  missingAuthEnv,
} from '@rights/auth/auth-config';

/**
 * Deployment diagnostics: which configuration the running instance can
 * actually see. Reports presence only — never a value — so it is safe to
 * hit in production when something like `/api/auth/get-session` starts
 * failing and the Worker logs aren't at hand.
 */
export async function GET(): Promise<Response> {
  const missing = missingAuthEnv();
  const warnings = authWarnings();

  const body = {
    status: missing.length === 0 ? (warnings.length === 0 ? 'ok' : 'degraded') : 'error',
    config: {
      auth: missing.length === 0,
      // The D1 binding or a libSQL URL — whichever this runtime has.
      database: hasDatabase(),
      // Via googleCredentials() so this agrees with what auth actually does,
      // including the NEXT_PUBLIC_ fallback for the client ID.
      google: googleCredentials() !== null,
      magicLinkEmail: Boolean(getEnv('AUTH_RESEND_KEY')),
    },
    // Names of required-but-absent configuration. Names only; never values.
    missing,
    // Set-these-too: auth still serves requests without them.
    warnings,
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}
