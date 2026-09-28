export const dynamic = 'force-dynamic';

import { getForSeeker } from '@/lib/agreements/service.js';
import { handle, json, siteOrigin } from '@/lib/agreements/http.js';

/** The seeker's tracker view. `?k=` is the seeker's private token. */
export async function GET(request, { params }) {
  return handle('load agreement', async () => {
    const { id } = await params;
    const key = new URL(request.url).searchParams.get('k') || '';
    return json(await getForSeeker(id, key, { origin: await siteOrigin(request) }));
  });
}
