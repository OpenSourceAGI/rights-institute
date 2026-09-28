/**
 * Hashing helpers shared by the agreement flow and the Prosper ledger.
 * Web Crypto only, so the same code runs in the Worker, Node and Vitest.
 */

const encoder = new TextEncoder();

/** Lowercase hex SHA-256 of a string. */
export async function sha256Hex(input) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * JSON with object keys sorted at every level, so the same data always
 * serializes — and therefore hashes — the same way.
 */
export function canonicalJson(value) {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

/** An unguessable URL-safe token (32 random bytes). */
export function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Constant-time string comparison for bearer tokens. */
export function tokensEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * The hash of the agreement text and parties — what the employer signs, and
 * what the seeker must then sign unchanged.
 */
export function contentHashOf(agreement) {
  return sha256Hex(
    canonicalJson({
      title: agreement.title,
      paragraphs: agreement.paragraphs.map((p) => ({ heading: p.heading, body: p.body })),
      seekerName: agreement.seekerName,
      seekerEmail: agreement.seekerEmail,
      employerName: agreement.employerName,
      employerEmail: agreement.employerEmail,
      employerSignerName: agreement.employerSignerName,
      employerSignerTitle: agreement.employerSignerTitle,
    })
  );
}

function toEpochSeconds(date) {
  if (date == null) return null;
  const ms = date instanceof Date ? date.getTime() : Number(date) * 1000;
  return Math.floor(ms / 1000);
}

/** The hash of the fully executed agreement: content plus both signatures. */
export async function documentHashOf(agreement) {
  return sha256Hex(
    canonicalJson({
      contentHash: agreement.contentHash,
      employerSignature: await sha256Hex(agreement.employerSignature || ''),
      employerSignedAt: toEpochSeconds(agreement.employerSignedAt),
      seekerSignature: await sha256Hex(agreement.seekerSignature || ''),
      seekerSignedAt: toEpochSeconds(agreement.seekerSignedAt),
    })
  );
}

/** A human-readable certificate ID derived from the document hash. */
export function certificateIdOf(documentHash) {
  const h = documentHash.slice(0, 16).toUpperCase();
  return `PRSP-${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}`;
}
