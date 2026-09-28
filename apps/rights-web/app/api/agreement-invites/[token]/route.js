export const dynamic = 'force-dynamic';

import { employerSign, openInvite, requestMeta } from '@/lib/agreements/service.js';
import { handle, json, readJson, siteOrigin } from '@/lib/agreements/http.js';

/**
 * The employer's view of an invite. Loading it is what the seeker's tracker
 * counts as "opened"; `?preview=1` (the seeker checking their own link) is
 * not counted.
 */
export async function GET(request, { params }) {
  return handle('open invite', async () => {
    const { token } = await params;
    const track = new URL(request.url).searchParams.get('preview') !== '1';
    return json(
      await openInvite(token, { origin: await siteOrigin(request), meta: requestMeta(request), track })
    );
  });
}

/**
 * The employer submits: { paragraphs, employerName, employerEmail,
 * signerName, signerTitle, signature, agree }.
 */
export async function POST(request, { params }) {
  return handle('sign invite', async () => {
    const { token } = await params;
    const body = await readJson(request);
    return json(
      await employerSign(token, body, { origin: await siteOrigin(request), meta: requestMeta(request) })
    );
  });
}
