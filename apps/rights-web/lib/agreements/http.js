/** Small helpers shared by the agreement route handlers. */
import { getEnv } from '@/lib/env';
import { auth } from '@/lib/auth';
import { AgreementError } from './service.js';

export function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

/** Run a handler, mapping AgreementError to its status and anything else to 500. */
export async function handle(label, fn) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof AgreementError) return json({ error: error.message }, error.status);
    console.error(`[agreements] ${label} failed:`, error);
    return json({ error: `Failed to ${label}` }, 500);
  }
}

export async function readJson(request) {
  try {
    return (await request.json()) ?? {};
  } catch {
    throw new AgreementError('Request body must be JSON');
  }
}

/** Public origin for links in emails: SITE_URL when set, else the request's own. */
export function siteOrigin(request) {
  const configured = getEnv('SITE_URL');
  return (configured || new URL(request.url).origin).replace(/\/$/, '');
}

/** The signed-in user's id, or null — signing in is optional for this flow. */
export async function optionalUserId(request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
