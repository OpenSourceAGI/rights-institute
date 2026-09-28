/**
 * The job-seeker → employer agreement flow.
 *
 *   1. The seeker pre-fills an agreement and gets two links: a shareable
 *      invite link for the employer and a private tracker link for
 *      themselves. The invite can also be emailed from here.
 *   2. Each time the invite link is opened it is recorded, which is what the
 *      tracker shows.
 *   3. The employer may rewrite any paragraph, then signs and submits. The
 *      text is frozen and its hash recorded.
 *   4. The seeker countersigns the same text. The executed agreement is
 *      hashed, written to the Prosper ledger (and anchored on-chain when
 *      configured), and both parties are emailed the certificate.
 */
import { and, asc, desc, eq, gt, inArray, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { agreementEvents, agreements } from '@/lib/db/schema';
import {
  certificateIdOf,
  contentHashOf,
  documentHashOf,
  randomToken,
  tokensEqual,
} from './hash.js';
import { anchorBlock, explorerTxUrl } from './anchor.js';
import { appendBlock, recordAnchor } from './ledger.js';
import {
  sendCertificateEmail,
  sendCountersignEmail,
  sendInviteEmail,
  sendTrackerEmail,
} from './email.js';

export const LIMITS = {
  paragraphs: 60,
  heading: 200,
  body: 8000,
  title: 200,
  name: 200,
  message: 2000,
  // A drawn signature as a PNG data URL.
  signature: 500_000,
  // Emails one IP may trigger per hour, and reminders per agreement.
  emailsPerIpPerHour: 10,
  remindersPerAgreement: 3,
};

/** A 4xx the route handler reports to the caller as-is. */
export class AgreementError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'AgreementError';
    this.status = status;
  }
}

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;

function cleanText(value, max, field, { required = true } = {}) {
  const text = typeof value === 'string' ? value.trim() : '';
  if (required && !text) throw new AgreementError(`${field} is required`);
  if (text.length > max) throw new AgreementError(`${field} is too long (max ${max} characters)`);
  return text;
}

function cleanEmail(value, field, { required = true } = {}) {
  const email = cleanText(value, 254, field, { required }).toLowerCase();
  if (email && !EMAIL_RE.test(email)) throw new AgreementError(`${field} is not a valid email address`);
  return email;
}

function cleanParagraphs(value) {
  if (!Array.isArray(value) || value.length === 0) throw new AgreementError('The agreement needs at least one paragraph');
  if (value.length > LIMITS.paragraphs) throw new AgreementError(`At most ${LIMITS.paragraphs} paragraphs are allowed`);
  const paragraphs = value
    .map((p, i) => ({
      id: typeof p?.id === 'string' && p.id.length <= 64 ? p.id : `p${i + 1}`,
      heading: cleanText(p?.heading, LIMITS.heading, `Paragraph ${i + 1} heading`, { required: false }),
      body: cleanText(p?.body, LIMITS.body, `Paragraph ${i + 1} text`, { required: false }),
    }))
    .filter((p) => p.heading || p.body);
  if (paragraphs.length === 0) throw new AgreementError('The agreement needs at least one paragraph');
  return paragraphs;
}

function cleanSignature(value) {
  if (typeof value !== 'string' || !/^data:image\/(png|jpeg|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(value)) {
    throw new AgreementError('A drawn signature is required');
  }
  if (value.length > LIMITS.signature) throw new AgreementError('The signature image is too large');
  return value;
}

function requireConsent(agree) {
  if (agree !== true) {
    throw new AgreementError('You must agree to sign electronically');
  }
}

/** Request metadata recorded with each audit event. */
export function requestMeta(request) {
  return {
    ipAddress:
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      null,
    userAgent: request.headers.get('user-agent')?.slice(0, 400) || null,
  };
}

export function linksFor(origin, agreement) {
  return {
    inviteUrl: `${origin}/contract/invite/${agreement.inviteToken}`,
    trackerUrl: `${origin}/contract/track/${agreement.id}?k=${agreement.seekerToken}`,
    certificateUrl: agreement.certificateId ? `${origin}/contract/certificate/${agreement.certificateId}` : null,
  };
}

async function logEvent(agreementId, type, actor, meta = {}, detail = null) {
  await db.insert(agreementEvents).values({
    id: crypto.randomUUID(),
    agreementId,
    type,
    actor,
    detail: detail == null ? null : typeof detail === 'string' ? detail : JSON.stringify(detail),
    ipAddress: meta.ipAddress ?? null,
    userAgent: meta.userAgent ?? null,
    createdAt: new Date(),
  });
}

/** Throws when this IP has already triggered too many emails in the last hour. */
async function assertEmailBudget(meta) {
  if (!meta.ipAddress) return;
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const row = await db
    .select({ n: sql`count(*)` })
    .from(agreementEvents)
    .where(
      and(
        eq(agreementEvents.ipAddress, meta.ipAddress),
        inArray(agreementEvents.type, ['invite_emailed', 'reminder_emailed']),
        gt(agreementEvents.createdAt, since)
      )
    )
    .get();
  if (Number(row?.n ?? 0) >= LIMITS.emailsPerIpPerHour) {
    throw new AgreementError('Too many emails sent from this connection — copy the link and send it yourself instead', 429);
  }
}

// ---------------------------------------------------------------------------
// Views: what each party is allowed to see.
// ---------------------------------------------------------------------------

function baseView(a) {
  return {
    id: a.id,
    title: a.title,
    type: a.type,
    status: a.status,
    paragraphs: a.paragraphs,
    seekerName: a.seekerName,
    seekerEmail: a.seekerEmail,
    employerName: a.employerName,
    employerEmail: a.employerEmail,
    employerSignerName: a.employerSignerName,
    employerSignerTitle: a.employerSignerTitle,
    employerSignature: a.employerSignature,
    employerSignedAt: a.employerSignedAt,
    seekerSignature: a.seekerSignature,
    seekerSignedAt: a.seekerSignedAt,
    contentHash: a.contentHash,
    documentHash: a.documentHash,
    certificateId: a.certificateId,
    createdAt: a.createdAt,
  };
}

async function seekerView(a, origin) {
  const events = await db
    .select({
      type: agreementEvents.type,
      actor: agreementEvents.actor,
      detail: agreementEvents.detail,
      createdAt: agreementEvents.createdAt,
    })
    .from(agreementEvents)
    .where(eq(agreementEvents.agreementId, a.id))
    .orderBy(asc(agreementEvents.createdAt))
    .all();
  return {
    ...baseView(a),
    tracking: {
      opened: a.openCount > 0,
      openCount: a.openCount,
      firstOpenedAt: a.firstOpenedAt,
      lastOpenedAt: a.lastOpenedAt,
    },
    events,
    links: linksFor(origin, a),
  };
}

function employerView(a, origin) {
  const { certificateUrl } = linksFor(origin, a);
  return { ...baseView(a), editable: a.status === 'sent' || a.status === 'opened', certificateUrl };
}

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

async function bySeeker(id, key) {
  const a = await db.select().from(agreements).where(eq(agreements.id, String(id))).get();
  if (!a || !tokensEqual(a.seekerToken, key)) throw new AgreementError('Agreement not found', 404);
  return a;
}

async function byInvite(token) {
  const a = await db.select().from(agreements).where(eq(agreements.inviteToken, String(token))).get();
  if (!a) throw new AgreementError('This invite link is not valid', 404);
  return a;
}

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

/** Step 1 — the seeker creates the invite. */
export async function createAgreement(input, { origin, meta, userId }) {
  const now = new Date();
  const agreement = {
    id: crypto.randomUUID(),
    inviteToken: randomToken(),
    seekerToken: randomToken(),
    ownerUserId: userId || null,
    type: 'employment',
    title: cleanText(input.title, LIMITS.title, 'Title'),
    status: 'sent',
    paragraphs: cleanParagraphs(input.paragraphs),
    seekerName: cleanText(input.seekerName, LIMITS.name, 'Your name'),
    seekerEmail: cleanEmail(input.seekerEmail, 'Your email'),
    employerName: cleanText(input.employerName, LIMITS.name, 'Employer name', { required: false }) || null,
    employerEmail: cleanEmail(input.employerEmail, 'Employer email', { required: false }) || null,
    openCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const message = cleanText(input.message, LIMITS.message, 'Message', { required: false });
  const wantsEmail = input.sendEmail === true;
  if (wantsEmail && !agreement.employerEmail) throw new AgreementError('Add the employer email to send the invite by email');
  if (wantsEmail) await assertEmailBudget(meta);

  await db.insert(agreements).values(agreement);
  await logEvent(agreement.id, 'created', 'seeker', meta);

  const links = linksFor(origin, agreement);
  let emailSent = false;
  if (wantsEmail) {
    emailSent = await sendInviteEmail({ agreement, inviteUrl: links.inviteUrl, message });
    await logEvent(agreement.id, emailSent ? 'invite_emailed' : 'invite_email_failed', 'system', meta, agreement.employerEmail);
  }
  // Best effort: the tracker link is also shown on screen right away.
  const trackerEmailed = await sendTrackerEmail({ agreement, ...links });

  return { id: agreement.id, ...links, emailSent, trackerEmailed };
}

/** The seeker's tracker. */
export async function getForSeeker(id, key, { origin }) {
  return seekerView(await bySeeker(id, key), origin);
}

/** Re-send (or first send) the invite email from the tracker. */
export async function remindEmployer(id, key, input, { origin, meta }) {
  const a = await bySeeker(id, key);
  if (a.status !== 'sent' && a.status !== 'opened') throw new AgreementError('The employer has already responded');
  const employerEmail = cleanEmail(input.employerEmail || a.employerEmail, 'Employer email');
  const reminders = await db
    .select({ n: sql`count(*)` })
    .from(agreementEvents)
    .where(and(eq(agreementEvents.agreementId, a.id), eq(agreementEvents.type, 'reminder_emailed')))
    .get();
  if (Number(reminders?.n ?? 0) >= LIMITS.remindersPerAgreement) {
    throw new AgreementError('Reminder limit reached — copy the invite link and send it yourself', 429);
  }
  await assertEmailBudget(meta);
  if (employerEmail !== a.employerEmail) {
    await db.update(agreements).set({ employerEmail, updatedAt: new Date() }).where(eq(agreements.id, a.id));
  }
  const agreement = { ...a, employerEmail };
  const sent = await sendInviteEmail({
    agreement,
    inviteUrl: linksFor(origin, a).inviteUrl,
    message: cleanText(input.message, LIMITS.message, 'Message', { required: false }),
  });
  await logEvent(a.id, sent ? 'reminder_emailed' : 'invite_email_failed', 'seeker', meta, employerEmail);
  if (!sent) throw new AgreementError('The email could not be sent — copy the invite link instead', 502);
  return seekerView(agreement, origin);
}

/** Step 2 — the employer opens the invite. Records the open for the tracker. */
export async function openInvite(token, { origin, meta, track = true }) {
  const a = await byInvite(token);
  if (!track) return employerView(a, origin);

  const now = new Date();
  // Refreshes within ten minutes count toward openCount but not as new events.
  const recentOpen = a.lastOpenedAt && now.getTime() - new Date(a.lastOpenedAt).getTime() < 10 * 60 * 1000;
  const update = {
    openCount: sql`${agreements.openCount} + 1`,
    lastOpenedAt: now,
    ...(a.firstOpenedAt ? {} : { firstOpenedAt: now }),
    ...(a.status === 'sent' ? { status: 'opened' } : {}),
  };
  await db.update(agreements).set(update).where(eq(agreements.id, a.id));
  if (!recentOpen) await logEvent(a.id, 'link_opened', 'employer', meta);

  return employerView({ ...a, ...update, status: a.status === 'sent' ? 'opened' : a.status }, origin);
}

/** Step 3 — the employer edits, signs and submits. */
export async function employerSign(token, input, { origin, meta }) {
  const a = await byInvite(token);
  if (a.status !== 'sent' && a.status !== 'opened') {
    throw new AgreementError('This agreement has already been signed by the employer', 409);
  }
  requireConsent(input.agree);

  const paragraphs = cleanParagraphs(input.paragraphs);
  const edited = JSON.stringify(paragraphs.map((p) => [p.heading, p.body])) !==
    JSON.stringify(a.paragraphs.map((p) => [p.heading, p.body]));

  const signed = {
    ...a,
    paragraphs,
    employerName: cleanText(input.employerName, LIMITS.name, 'Company / employer name'),
    employerEmail: cleanEmail(input.employerEmail, 'Employer email'),
    employerSignerName: cleanText(input.signerName, LIMITS.name, 'Signer name'),
    employerSignerTitle: cleanText(input.signerTitle, LIMITS.name, 'Signer title', { required: false }) || null,
    employerSignature: cleanSignature(input.signature),
    employerSignedAt: new Date(),
    status: 'employer_signed',
  };
  signed.contentHash = await contentHashOf(signed);

  const [updated] = await db
    .update(agreements)
    .set({
      paragraphs: signed.paragraphs,
      employerName: signed.employerName,
      employerEmail: signed.employerEmail,
      employerSignerName: signed.employerSignerName,
      employerSignerTitle: signed.employerSignerTitle,
      employerSignature: signed.employerSignature,
      employerSignedAt: signed.employerSignedAt,
      contentHash: signed.contentHash,
      status: 'employer_signed',
      updatedAt: new Date(),
    })
    // Guarded on status so two submits can't both win.
    .where(and(eq(agreements.id, a.id), inArray(agreements.status, ['sent', 'opened'])))
    .returning({ id: agreements.id });
  if (!updated) throw new AgreementError('This agreement has already been signed by the employer', 409);

  if (edited) await logEvent(a.id, 'employer_edited', 'employer', meta);
  await logEvent(a.id, 'employer_signed', 'employer', meta, { contentHash: signed.contentHash });

  const sent = await sendCountersignEmail({ agreement: signed, trackerUrl: linksFor(origin, a).trackerUrl });
  if (sent) await logEvent(a.id, 'countersign_emailed', 'system', meta, a.seekerEmail);

  return employerView(signed, origin);
}

/** Step 4 — the seeker countersigns; the certificate is issued. */
export async function seekerSign(id, key, input, { origin, meta }) {
  const a = await bySeeker(id, key);
  if (a.status === 'completed') throw new AgreementError('This agreement is already fully signed', 409);
  if (a.status !== 'employer_signed') throw new AgreementError('The employer has not signed yet', 409);
  requireConsent(input.agree);
  // The seeker must be signing exactly the text they reviewed.
  if (input.contentHash !== a.contentHash) {
    throw new AgreementError('The agreement changed since you loaded it — reload and review it again', 409);
  }

  const signed = { ...a, seekerSignature: cleanSignature(input.signature), seekerSignedAt: new Date() };
  signed.documentHash = await documentHashOf(signed);
  signed.certificateId = certificateIdOf(signed.documentHash);
  signed.status = 'completed';

  const [updated] = await db
    .update(agreements)
    .set({
      seekerSignature: signed.seekerSignature,
      seekerSignedAt: signed.seekerSignedAt,
      documentHash: signed.documentHash,
      certificateId: signed.certificateId,
      status: 'completed',
      updatedAt: new Date(),
    })
    .where(and(eq(agreements.id, a.id), eq(agreements.status, 'employer_signed')))
    .returning({ id: agreements.id });
  if (!updated) throw new AgreementError('This agreement is already fully signed', 409);
  await logEvent(a.id, 'seeker_signed', 'seeker', meta);

  const block = await appendBlock({
    refId: a.id,
    certificateId: signed.certificateId,
    documentHash: signed.documentHash,
  });
  await logEvent(a.id, 'ledger_recorded', 'system', meta, { height: block.height, blockHash: block.blockHash });

  const anchor = await anchorBlock(block);
  if (anchor) {
    await recordAnchor(block.height, anchor.txHash, anchor.chainId);
    block.anchorTxHash = anchor.txHash;
    block.anchorChainId = anchor.chainId;
    await logEvent(a.id, 'anchored_onchain', 'system', meta, anchor);
  }

  const links = linksFor(origin, signed);
  const common = {
    agreement: signed,
    block,
    certificateUrl: links.certificateUrl,
    explorerUrl: explorerTxUrl(block.anchorTxHash),
  };
  const [toSeeker, toEmployer] = await Promise.all([
    sendCertificateEmail({ ...common, to: signed.seekerEmail, partyUrl: links.trackerUrl }),
    sendCertificateEmail({ ...common, to: signed.employerEmail, partyUrl: links.inviteUrl }),
  ]);
  if (toSeeker || toEmployer) {
    await logEvent(a.id, 'certificate_emailed', 'system', meta, { seeker: toSeeker, employer: toEmployer });
  }

  return seekerView(signed, origin);
}

/** A seeker's agreements, newest first — for the signed-in dashboard. */
export function listForUser(userId) {
  return db
    .select({
      id: agreements.id,
      title: agreements.title,
      status: agreements.status,
      employerName: agreements.employerName,
      seekerToken: agreements.seekerToken,
      certificateId: agreements.certificateId,
      openCount: agreements.openCount,
      createdAt: agreements.createdAt,
    })
    .from(agreements)
    .where(eq(agreements.ownerUserId, userId))
    .orderBy(desc(agreements.createdAt))
    .all();
}
