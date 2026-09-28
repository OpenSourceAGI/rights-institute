export const dynamic = 'force-dynamic';

import { remindEmployer, requestMeta } from '@/lib/agreements/service.js';
import { handle, json, readJson, siteOrigin } from '@/lib/agreements/http.js';

/** Email (or re-email) the invite link: { k, employerEmail?, message? }. */
export async function POST(request, { params }) {
  return handle('send reminder', async () => {
    const { id } = await params;
    const body = await readJson(request);
    return json(
      await remindEmployer(id, body.k, body, { origin: await siteOrigin(request), meta: requestMeta(request) })
    );
  });
}
