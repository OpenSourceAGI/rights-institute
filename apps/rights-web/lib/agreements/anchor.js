/**
 * Optional on-chain anchoring of Prosper ledger blocks.
 *
 * Enabled only when all of these are set (see
 * content/docs/environment-variables.mdx):
 *   PROSPER_RPC_URL           JSON-RPC endpoint of the chain
 *   PROSPER_REGISTRY_ADDRESS  deployed packages/prosper-coin AgreementRegistry
 *   PROSPER_ANCHOR_KEY        0x-prefixed private key of the anchoring account
 *   PROSPER_CHAIN_ID          (optional) chain id, read from the RPC otherwise
 *
 * Without them the ledger still works; blocks simply carry no anchorTxHash.
 * viem is imported lazily so deployments that never anchor don't load it.
 */
import { getEnv } from '@/lib/env';

const REGISTRY_ABI = [
  {
    type: 'function',
    name: 'anchor',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'height', type: 'uint256' },
      { name: 'blockHash', type: 'bytes32' },
      { name: 'documentHash', type: 'bytes32' },
      { name: 'certificateId', type: 'string' },
    ],
    outputs: [],
  },
];

export function anchorConfig() {
  const rpcUrl = getEnv('PROSPER_RPC_URL');
  const registry = getEnv('PROSPER_REGISTRY_ADDRESS');
  const key = getEnv('PROSPER_ANCHOR_KEY');
  if (!rpcUrl || !registry || !key) return null;
  const chainId = Number(getEnv('PROSPER_CHAIN_ID')) || undefined;
  return { rpcUrl, registry, key, chainId };
}

/**
 * Submit the block to the registry contract. Resolves to
 * { txHash, chainId }, or null when anchoring is not configured or fails —
 * a failed anchor never fails the signing that triggered it.
 */
export async function anchorBlock(block) {
  const config = anchorConfig();
  if (!config) return null;
  try {
    const { createWalletClient, http, defineChain } = await import('viem');
    const { privateKeyToAccount } = await import('viem/accounts');
    const transport = http(config.rpcUrl);

    let chainId = config.chainId;
    if (!chainId) {
      const res = await fetch(config.rpcUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_chainId', params: [] }),
      });
      chainId = Number((await res.json()).result);
    }
    const chain = defineChain({
      id: chainId,
      name: 'Prosper',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [config.rpcUrl] } },
    });

    const client = createWalletClient({ account: privateKeyToAccount(config.key), chain, transport });
    const txHash = await client.writeContract({
      address: config.registry,
      abi: REGISTRY_ABI,
      functionName: 'anchor',
      args: [BigInt(block.height), `0x${block.blockHash}`, `0x${block.documentHash}`, block.certificateId],
    });
    return { txHash, chainId };
  } catch (error) {
    console.error('[prosper] anchoring block', block.height, 'failed:', error);
    return null;
  }
}

/** Block-explorer link for an anchor transaction, when an explorer is configured. */
export function explorerTxUrl(txHash) {
  const base = getEnv('PROSPER_EXPLORER_URL');
  return base && txHash ? `${base.replace(/\/$/, '')}/tx/${txHash}` : null;
}
