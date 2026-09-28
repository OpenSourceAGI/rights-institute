/**
 * End-to-end test of the invite → employer edit & sign → seeker countersign
 * → certificate flow, against an in-memory SQLite database with the real
 * migrations applied.
 */
import { readFileSync, readdirSync } from 'fs';
import { resolve } from 'path';
import { beforeAll, describe, expect, it, vi } from 'vitest';

const sent: { kind: string; args: any }[] = [];

vi.mock('@/lib/db', async () => {
  const { createClient } = await import('@libsql/client');
  const { drizzle } = await import('drizzle-orm/libsql');
  const schema = await import('@/lib/db/schema');
  const client = createClient({ url: ':memory:' });
  const dir = resolve(__dirname, '../lib/db/drizzle');
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    for (const statement of readFileSync(resolve(dir, file), 'utf8').split('--> statement-breakpoint')) {
      if (statement.trim()) await client.execute(statement);
    }
  }
  return { db: drizzle(client, { schema }) };
});

vi.mock('@/lib/agreements/email.js', () => {
  const record = (kind: string) => async (args: any) => {
    sent.push({ kind, args });
    return true;
  };
  return {
    sendInviteEmail: record('invite'),
    sendTrackerEmail: record('tracker'),
    sendCountersignEmail: record('countersign'),
    sendCertificateEmail: record('certificate'),
  };
});

const origin = 'https://rights.test';
const meta = { ipAddress: '203.0.113.7', userAgent: 'vitest' };
const signature = 'data:image/png;base64,iVBORw0KGgo=';

let service: typeof import('@/lib/agreements/service.js');
let ledger: typeof import('@/lib/agreements/ledger.js');
let certificates: typeof import('@/lib/agreements/certificate.js');

beforeAll(async () => {
  service = await import('@/lib/agreements/service.js');
  ledger = await import('@/lib/agreements/ledger.js');
  certificates = await import('@/lib/agreements/certificate.js');
});

function paragraphs() {
  return [
    { id: 'a', heading: 'Position', body: 'Employee will work as Engineer.' },
    { id: 'b', heading: 'Compensation', body: 'Employer will pay $100,000 per year.' },
  ];
}

async function createInvite() {
  return service.createAgreement(
    {
      title: 'Employment Agreement — Engineer',
      paragraphs: paragraphs(),
      seekerName: 'Sam Seeker',
      seekerEmail: 'sam@example.com',
      employerName: 'Acme Inc',
      employerEmail: 'hr@acme.example',
      sendEmail: true,
    },
    { origin, meta, userId: null }
  );
}

const tokenOf = (inviteUrl: string) => inviteUrl.split('/').pop()!;
const keyOf = (trackerUrl: string) => new URL(trackerUrl).searchParams.get('k')!;

describe('agreement invite flow', () => {
  it('runs from invite to a verified certificate on the ledger', async () => {
    const created = await createInvite();
    expect(created.emailSent).toBe(true);
    expect(sent.map((s) => s.kind)).toEqual(['invite', 'tracker']);
    const token = tokenOf(created.inviteUrl);
    const key = keyOf(created.trackerUrl);

    // Not opened yet.
    let tracker = await service.getForSeeker(created.id, key, { origin });
    expect(tracker.tracking.opened).toBe(false);

    // A seeker preview does not count; a real open does.
    await service.openInvite(token, { origin, meta, track: false });
    const view = await service.openInvite(token, { origin, meta });
    expect(view.editable).toBe(true);
    tracker = await service.getForSeeker(created.id, key, { origin });
    expect(tracker.status).toBe('opened');
    expect(tracker.tracking.openCount).toBe(1);
    expect(tracker.events.map((e) => e.type)).toContain('link_opened');

    // The employer rewrites a paragraph and signs.
    const edited = paragraphs();
    edited[1].body = 'Employer will pay $110,000 per year.';
    const signedByEmployer = await service.employerSign(
      token,
      { paragraphs: edited, employerName: 'Acme Inc', employerEmail: 'hr@acme.example', signerName: 'Erin Boss', signerTitle: 'CEO', signature, agree: true },
      { origin, meta }
    );
    expect(signedByEmployer.status).toBe('employer_signed');
    expect(signedByEmployer.editable).toBe(false);

    // Further edits are refused.
    await expect(
      service.employerSign(token, { paragraphs: edited, employerName: 'X', employerEmail: 'x@x.co', signerName: 'X', signature, agree: true }, { origin, meta })
    ).rejects.toThrow(/already been signed/);

    tracker = await service.getForSeeker(created.id, key, { origin });
    expect(tracker.paragraphs[1].body).toContain('$110,000');
    expect(tracker.events.map((e) => e.type)).toEqual(expect.arrayContaining(['employer_edited', 'employer_signed']));

    // The seeker must sign the exact text they reviewed.
    await expect(
      service.seekerSign(created.id, key, { signature, agree: true, contentHash: 'stale' }, { origin, meta })
    ).rejects.toThrow(/changed since you loaded it/);

    const done = await service.seekerSign(
      created.id,
      key,
      { signature, agree: true, contentHash: tracker.contentHash },
      { origin, meta }
    );
    expect(done.status).toBe('completed');
    expect(done.certificateId).toMatch(/^PRSP-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);

    const certEmails = sent.filter((s) => s.kind === 'certificate').map((s) => s.args.to);
    expect(certEmails.sort()).toEqual(['hr@acme.example', 'sam@example.com']);

    const cert = await certificates.getCertificate(done.certificateId);
    expect(cert.verified).toBe(true);
    expect(cert.block.height).toBe(0);
    expect(cert.block.prevHash).toBe(ledger.GENESIS_PREV_HASH);
  });

  it('chains each certificate to the one before it', async () => {
    const created = await createInvite();
    const token = tokenOf(created.inviteUrl);
    const key = keyOf(created.trackerUrl);
    await service.employerSign(
      token,
      { paragraphs: paragraphs(), employerName: 'Acme Inc', employerEmail: 'hr@acme.example', signerName: 'Erin Boss', signature, agree: true },
      { origin, meta }
    );
    const { contentHash } = await service.getForSeeker(created.id, key, { origin });
    const done = await service.seekerSign(created.id, key, { signature, agree: true, contentHash }, { origin, meta });

    const cert = await certificates.getCertificate(done.certificateId);
    const [latest, previous] = await ledger.recentBlocks(2);
    expect(cert.block.height).toBe(1);
    expect(latest.prevHash).toBe(previous.blockHash);
    expect(await ledger.verifyChain()).toMatchObject({ valid: true, height: 2, tip: latest.blockHash });
  });

  it('rejects the wrong tracker key and unsigned submissions', async () => {
    const created = await createInvite();
    await expect(service.getForSeeker(created.id, 'nope', { origin })).rejects.toThrow(/not found/);
    await expect(
      service.employerSign(
        tokenOf(created.inviteUrl),
        { paragraphs: paragraphs(), employerName: 'Acme', employerEmail: 'hr@acme.example', signerName: 'Erin', signature, agree: false },
        { origin, meta }
      )
    ).rejects.toThrow(/agree to sign electronically/);
  });
});
