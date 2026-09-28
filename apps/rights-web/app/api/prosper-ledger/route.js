export const dynamic = 'force-dynamic';

import { recentBlocks, verifyChain } from '@/lib/agreements/ledger.js';
import { anchorConfig } from '@/lib/agreements/anchor.js';
import { handle, json } from '@/lib/agreements/http.js';

/** Public: the newest Prosper ledger blocks and whether the whole chain verifies. */
export async function GET(request) {
  return handle('load ledger', async () => {
    const limit = Math.min(Number(new URL(request.url).searchParams.get('limit')) || 25, 100);
    const [chain, blocks] = await Promise.all([verifyChain(), recentBlocks(limit)]);
    return json({ chain, anchoring: Boolean(anchorConfig()), blocks });
  });
}
