export const dynamic = 'force-dynamic';

import { requestMeta, seekerSign } from '@/lib/agreements/service.js';
import { handle, json, readJson, siteOrigin } from '@/lib/agreements/http.js';

/** The seeker countersigns: { k, signature, agree, contentHash }. */
export async function POST(request, { params }) {
  return handle('sign agreement', async () => {
    const { id } = await params;
    const body = await readJson(request);
    return json(
      await seekerSign(id, body.k, body, { origin: await siteOrigin(request), meta: requestMeta(request) })
    );
  });
}
