/**
 * The Prosper ledger — an append-only hash chain of issued certificates.
 *
 * Block n's hash commits to block n-1's, so the newest block hash
 * fingerprints every certificate ever recorded, and altering any past entry
 * breaks every later link. Blocks live in the `prosperLedger` table; when an
 * EVM registry is configured each block hash is also anchored on-chain (see
 * ./anchor.js), which makes the chain tamper-evident outside our database.
 */
import { asc, desc, eq, gt } from 'drizzle-orm';
import { db } from '@/lib/db';
import { prosperLedger } from '@/lib/db/schema';
import { sha256Hex } from './hash.js';

export const GENESIS_PREV_HASH = '0'.repeat(64);

/** The hash a block must carry given its contents. */
export function blockHashOf(block) {
  return sha256Hex(
    [block.height, block.prevHash, block.kind, block.certificateId, block.documentHash, block.timestamp].join('|')
  );
}

/**
 * Append a certificate to the chain and return the new block.
 *
 * `height` is the primary key, so two concurrent appends cannot both claim
 * the same height: the loser's insert fails and it retries on the new tip.
 */
export async function appendBlock({ kind = 'agreement', refId, certificateId, documentHash }) {
  for (let attempt = 0; attempt < 5; attempt++) {
    // Also re-checked after a failed insert: a concurrent append of the same
    // certificate is a success, not a conflict.
    const existing = await getBlockByCertificate(certificateId);
    if (existing) return existing;

    const tip = await db.select().from(prosperLedger).orderBy(desc(prosperLedger.height)).limit(1).get();
    const block = {
      height: tip ? tip.height + 1 : 0,
      prevHash: tip ? tip.blockHash : GENESIS_PREV_HASH,
      kind,
      refId,
      certificateId,
      documentHash,
      timestamp: Math.floor(Date.now() / 1000),
    };
    block.blockHash = await blockHashOf(block);
    try {
      await db.insert(prosperLedger).values(block);
      return { ...block, anchorTxHash: null, anchorChainId: null };
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
  throw new Error('Could not append to the Prosper ledger');
}

export function getBlockByCertificate(certificateId) {
  return db.select().from(prosperLedger).where(eq(prosperLedger.certificateId, certificateId)).get();
}

export function getBlockAfter(height) {
  return db
    .select()
    .from(prosperLedger)
    .where(gt(prosperLedger.height, height))
    .orderBy(asc(prosperLedger.height))
    .limit(1)
    .get();
}

export function recordAnchor(height, anchorTxHash, anchorChainId) {
  return db.update(prosperLedger).set({ anchorTxHash, anchorChainId }).where(eq(prosperLedger.height, height));
}

export function recentBlocks(limit = 25) {
  return db.select().from(prosperLedger).orderBy(desc(prosperLedger.height)).limit(limit).all();
}

/**
 * Recompute every block hash and link, oldest first.
 * Returns { valid, height, tip, brokenAt } — brokenAt is the first bad height.
 */
export async function verifyChain() {
  const blocks = await db.select().from(prosperLedger).orderBy(asc(prosperLedger.height)).all();
  let prevHash = GENESIS_PREV_HASH;
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const ok =
      block.height === i &&
      block.prevHash === prevHash &&
      block.blockHash === (await blockHashOf(block));
    if (!ok) return { valid: false, height: blocks.length, tip: null, brokenAt: block.height };
    prevHash = block.blockHash;
  }
  return { valid: true, height: blocks.length, tip: blocks.length ? prevHash : null, brokenAt: null };
}
