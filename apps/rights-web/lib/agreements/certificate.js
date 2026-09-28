/**
 * Public certificate lookup and verification.
 *
 * Shows who signed and when, plus the hashes — never the agreement text or
 * signature images, which stay with the two parties.
 */
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { agreements } from '@/lib/db/schema';
import { contentHashOf, documentHashOf } from './hash.js';
import { blockHashOf, getBlockAfter, getBlockByCertificate, verifyChain } from './ledger.js';
import { explorerTxUrl } from './anchor.js';
import { AgreementError } from './service.js';

export async function getCertificate(certificateId) {
  const id = String(certificateId).toUpperCase();
  const a = await db.select().from(agreements).where(eq(agreements.certificateId, id)).get();
  const block = await getBlockByCertificate(id);
  if (!a || !block) throw new AgreementError('Certificate not found', 404);

  // Recompute everything from what is stored, rather than trusting it.
  const contentHash = await contentHashOf(a);
  const documentHash = await documentHashOf({ ...a, contentHash });
  const next = await getBlockAfter(block.height);
  const chain = await verifyChain();

  const checks = {
    contentHash: contentHash === a.contentHash,
    documentHash: documentHash === a.documentHash && documentHash === block.documentHash,
    blockHash: (await blockHashOf(block)) === block.blockHash,
    linkedToNext: next ? next.prevHash === block.blockHash : true,
    chainValid: chain.valid,
  };

  return {
    certificateId: a.certificateId,
    title: a.title,
    type: a.type,
    employer: {
      name: a.employerName,
      signerName: a.employerSignerName,
      signerTitle: a.employerSignerTitle,
      signedAt: a.employerSignedAt,
    },
    employee: { name: a.seekerName, signedAt: a.seekerSignedAt },
    documentHash: a.documentHash,
    block: {
      height: block.height,
      blockHash: block.blockHash,
      prevHash: block.prevHash,
      timestamp: block.timestamp,
      nextHash: next?.blockHash ?? null,
      anchorTxHash: block.anchorTxHash,
      anchorChainId: block.anchorChainId,
      explorerUrl: explorerTxUrl(block.anchorTxHash),
    },
    ledger: { height: chain.height, tip: chain.tip },
    verified: Object.values(checks).every(Boolean),
    checks,
  };
}
