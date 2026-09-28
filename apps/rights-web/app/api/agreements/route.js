export const dynamic = 'force-dynamic';

import { createAgreement, listForUser, requestMeta } from '@/lib/agreements/service.js';
import { handle, json, optionalUserId, readJson, siteOrigin } from '@/lib/agreements/http.js';

/** Create an agreement invite (job seeker). No account needed. */
export async function POST(request) {
  return handle('create agreement', async () => {
    const body = await readJson(request);
    const result = await createAgreement(body, {
      origin: await siteOrigin(request),
      meta: requestMeta(request),
      userId: await optionalUserId(request),
    });
    return json(result, 201);
  });
}

/** The signed-in user's agreements, with tracker links. */
export async function GET(request) {
  return handle('list agreements', async () => {
    const userId = await optionalUserId(request);
    if (!userId) return json({ error: 'Unauthorized' }, 401);
    const origin = await siteOrigin(request);
    const rows = await listForUser(userId);
    return json(
      rows.map(({ seekerToken, ...row }) => ({
        ...row,
        trackerUrl: `${origin}/contract/track/${row.id}?k=${seekerToken}`,
      }))
    );
  });
}
