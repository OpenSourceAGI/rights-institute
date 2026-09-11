import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { oneTap, openAPI, magicLink } from 'better-auth/plugins';
import { Resend } from 'resend';
import { db } from '@rights/db';
import * as schema from '@rights/db/schema';
import { getEnv } from '@rights/env';
import {
  AuthConfigError,
  authBaseURL,
  authSecret,
  authWarnings,
  googleCredentials,
  missingAuthEnv,
  trustedOrigins,
} from './auth-config';

const APP_NAME = 'Rights Institute';

/**
 * Build the better-auth instance from the *runtime* env.
 *
 * Built on first use, not at module scope: values that only exist in the
 * Cloudflare Worker's per-request runtime env are invisible at module-eval
 * time, and anything that fails during construction would otherwise take down
 * every route importing this module.
 *
 * Only a missing database stops construction. Optional integrations are
 * registered only when their credentials exist, so a half-configured
 * deployment loses just that integration rather than the whole sign-in flow.
 */
function createAuth() {
  const missing = missingAuthEnv();
  if (missing.length > 0) throw new AuthConfigError(missing);

  for (const name of authWarnings()) {
    if (name === 'BETTER_AUTH_SECRET') {
      console.error(
        '[auth] BETTER_AUTH_SECRET is not set — better-auth is falling back to its ' +
          'built-in development secret, which is public. Sign-in works, but set a real ' +
          'one (`openssl rand -base64 32`, then `wrangler secret put BETTER_AUTH_SECRET`). ' +
          'Changing it later invalidates existing sessions.'
      );
    }
  }

  const google = googleCredentials();
  if (!google) {
    console.warn(
      '[auth] GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET not set — Google sign-in and the One Tap prompt are disabled.'
    );
  }

  const secret = authSecret();

  // Undefined on purpose in production: better-auth then derives the origin
  // per request. See the authBaseURL() comment for why guessing is worse.
  const baseURL = authBaseURL();

  return betterAuth({
    ...(baseURL ? { baseURL } : {}),
    ...(secret ? { secret } : {}),
    // Resolved per request so the origin the app is actually being served
    // from is always trusted — see trustedOrigins().
    trustedOrigins: (request: Request) => trustedOrigins(request),
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema,
    }),
    ...(google ? { socialProviders: { google } } : {}),
    emailVerification: {
      sendOnSignUp: false,
      autoSignInAfterVerification: true,
    },
    plugins: [
      // One Tap exchanges a Google ID token, so it is only useful when the
      // Google provider above is configured. The client ID is passed
      // explicitly as well: it is the audience the ID token is verified
      // against, and being explicit keeps the check working even if the
      // social provider is ever configured lazily.
      ...(google ? [oneTap({ clientId: google.clientId })] : []),
      openAPI(),
      magicLink({
        expiresIn: 300,
        disableSignUp: false,
        sendMagicLink: async ({ email, url }) => {
          const apiKey = getEnv('AUTH_RESEND_KEY');
          if (!apiKey) {
            console.warn('[auth] AUTH_RESEND_KEY missing — magic link not sent. URL:', url);
            return;
          }
          const resend = new Resend(apiKey);
          await resend.emails.send({
            from: `${APP_NAME} <noreply@rights.institute>`,
            to: email,
            subject: `Sign in to ${APP_NAME}`,
            html: `<p>Click the link below to sign in to ${APP_NAME}:</p>
                 <p><a href="${url}">Sign in</a></p>
                 <p>This link expires in 5 minutes.</p>`,
          });
        },
      }),
    ],
  });
}

let _auth: ReturnType<typeof createAuth> | null = null;

/** The better-auth instance, created on first use. Throws AuthConfigError when no database is reachable. */
export function getAuth() {
  if (!_auth) _auth = createAuth();
  return _auth;
}

/**
 * Same shape as before — `auth.api.getSession(...)`, `auth.handler(...)` —
 * but importing this module no longer constructs anything.
 */
export const auth = new Proxy({} as ReturnType<typeof createAuth>, {
  get(_target, prop) {
    const instance = getAuth() as any;
    const value = instance[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

export {
  AuthConfigError,
  missingAuthEnv,
  authWarnings,
  isAuthConfigured,
  hasDatabase,
  googleClientId,
} from './auth-config';
