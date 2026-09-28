export const dynamic = 'force-dynamic';

import { getCertificate } from '@/lib/agreements/certificate.js';
import { handle, json } from '@/lib/agreements/http.js';

/** Public: certificate metadata and a fresh verification against the Prosper ledger. */
export async function GET(request, { params }) {
  return handle('load certificate', async () => {
    const { certificateId } = await params;
    return json(await getCertificate(certificateId));
  });
}
