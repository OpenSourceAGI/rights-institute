/**
 * Agreement emails, sent through Resend.
 *
 * Uses RESEND_API_KEY, falling back to the AUTH_RESEND_KEY the magic-link
 * sign-in already needs. With neither set nothing is sent and callers get
 * `false` back, so the copy-a-link flow still works on a bare deployment.
 */
import { Resend } from 'resend';
import { getEnv } from '@/lib/env';

const APP_NAME = 'Rights Institute';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function emailConfigured() {
  return Boolean(getEnv('RESEND_API_KEY') || getEnv('AUTH_RESEND_KEY'));
}

async function send({ to, subject, html, attachments }) {
  const apiKey = getEnv('RESEND_API_KEY') || getEnv('AUTH_RESEND_KEY');
  if (!apiKey) {
    console.warn('[agreements] no Resend key — email to', to, 'not sent:', subject);
    return false;
  }
  const from = getEnv('AGREEMENTS_EMAIL_FROM') || `${APP_NAME} <noreply@rights.institute>`;
  try {
    const { error } = await new Resend(apiKey).emails.send({ from, to, subject, html, attachments });
    if (error) throw new Error(error.message);
    return true;
  } catch (error) {
    console.error('[agreements] sending email failed:', error);
    return false;
  }
}

function toBase64(text) {
  let binary = '';
  for (const b of new TextEncoder().encode(text)) binary += String.fromCharCode(b);
  return btoa(binary);
}

function layout(body) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto;color:#0f172a;line-height:1.55">
${body}
<p style="color:#64748b;font-size:12px;margin-top:32px">Sent by ${APP_NAME} · rights.institute</p>
</div>`;
}

function button(url, label) {
  return `<p><a href="${escapeHtml(url)}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:bold">${escapeHtml(label)}</a></p>
<p style="font-size:12px;color:#64748b">Or paste this link into your browser:<br>${escapeHtml(url)}</p>`;
}

/** To the employer: the seeker's invitation to review, edit and sign. */
export function sendInviteEmail({ agreement, inviteUrl, message }) {
  const seeker = escapeHtml(agreement.seekerName);
  return send({
    to: agreement.employerEmail,
    subject: `${agreement.seekerName} invited you to review and sign: ${agreement.title}`,
    html: layout(`<h2>${escapeHtml(agreement.title)}</h2>
<p>${seeker} (${escapeHtml(agreement.seekerEmail)}) has pre-filled an agreement and invited
${agreement.employerName ? escapeHtml(agreement.employerName) : 'you'} to review it.</p>
${message ? `<blockquote style="border-left:3px solid #cbd5e1;margin:0;padding-left:12px;color:#334155">${escapeHtml(message)}</blockquote>` : ''}
<p>You can edit any paragraph, then sign and submit it. ${seeker} will be asked to countersign.</p>
${button(inviteUrl, 'Review & sign the agreement')}`),
  });
}

/** To the seeker: their private tracker link, right after creating the invite. */
export function sendTrackerEmail({ agreement, trackerUrl, inviteUrl }) {
  return send({
    to: agreement.seekerEmail,
    subject: `Your invite is ready: ${agreement.title}`,
    html: layout(`<h2>Your agreement invite is ready</h2>
<p>Share this invite link with your employer (anyone with it can edit and sign as the employer):</p>
<p style="background:#f1f5f9;padding:10px;border-radius:6px;word-break:break-all">${escapeHtml(inviteUrl)}</p>
<p>Keep the tracker link below private — it shows when the invite is opened and is where you countersign.</p>
${button(trackerUrl, 'Open your tracker')}`),
  });
}

/** To the seeker: the employer has signed; countersign to finish. */
export function sendCountersignEmail({ agreement, trackerUrl }) {
  const employer = escapeHtml(agreement.employerName || 'Your employer');
  return send({
    to: agreement.seekerEmail,
    subject: `${agreement.employerName || 'Your employer'} signed — your signature is needed`,
    html: layout(`<h2>${employer} signed ${escapeHtml(agreement.title)}</h2>
<p>${escapeHtml(agreement.employerSignerName)}${agreement.employerSignerTitle ? `, ${escapeHtml(agreement.employerSignerTitle)}` : ''}
signed the agreement. Review the final text — including any paragraphs they changed — and add your signature to complete it.</p>
${button(trackerUrl, 'Review & countersign')}`),
  });
}

/** The executed agreement as a standalone HTML file, attached to the certificate email. */
export function renderSignedAgreementHtml(agreement, block) {
  const signature = (label, name, title, image, signedAt) => `<div style="flex:1;min-width:240px">
<p style="margin:0 0 6px;font-weight:bold">${escapeHtml(label)}</p>
<img src="${escapeHtml(image)}" alt="${escapeHtml(label)} signature" style="max-height:90px;border-bottom:1px solid #94a3b8">
<p style="margin:4px 0 0">${escapeHtml(name)}${title ? `, ${escapeHtml(title)}` : ''}</p>
<p style="margin:0;color:#64748b;font-size:12px">Signed ${escapeHtml(new Date(signedAt).toUTCString())}</p></div>`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(agreement.title)}</title></head>
<body style="font-family:Georgia,serif;max-width:760px;margin:40px auto;padding:0 16px;color:#0f172a;line-height:1.6">
<h1 style="text-align:center">${escapeHtml(agreement.title)}</h1>
<p>Between <strong>${escapeHtml(agreement.employerName)}</strong> ("Employer") and <strong>${escapeHtml(agreement.seekerName)}</strong> ("Employee").</p>
${agreement.paragraphs
  .map(
    (p, i) => `<h3>${i + 1}. ${escapeHtml(p.heading)}</h3><p style="white-space:pre-wrap">${escapeHtml(p.body)}</p>`
  )
  .join('\n')}
<div style="display:flex;gap:32px;flex-wrap:wrap;margin-top:32px">
${signature('Employer', agreement.employerSignerName, agreement.employerSignerTitle, agreement.employerSignature, agreement.employerSignedAt)}
${signature('Employee', agreement.seekerName, '', agreement.seekerSignature, agreement.seekerSignedAt)}
</div>
<hr style="margin-top:32px">
<p style="font-family:monospace;font-size:12px;word-break:break-all">
Certificate: ${escapeHtml(agreement.certificateId)}<br>
Document hash (SHA-256): ${escapeHtml(agreement.documentHash)}<br>
Prosper ledger block #${block.height}: ${escapeHtml(block.blockHash)}<br>
Previous block: ${escapeHtml(block.prevHash)}${block.anchorTxHash ? `<br>On-chain anchor tx: ${escapeHtml(block.anchorTxHash)}` : ''}
</p></body></html>`;
}

/** To both parties: the official certificate plus the signed agreement. */
export function sendCertificateEmail({ agreement, block, certificateUrl, partyUrl, to, explorerUrl }) {
  const row = (k, v) =>
    `<tr><td style="padding:6px 10px;color:#64748b;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 10px;font-family:monospace;word-break:break-all">${v}</td></tr>`;
  const anchor = block.anchorTxHash
    ? explorerUrl
      ? `<a href="${escapeHtml(explorerUrl)}">${escapeHtml(block.anchorTxHash)}</a>`
      : escapeHtml(block.anchorTxHash)
    : null;

  return send({
    to,
    subject: `Certificate ${agreement.certificateId}: ${agreement.title} is fully signed`,
    html: layout(`<div style="border:3px double #0f172a;padding:24px;border-radius:8px">
<p style="text-align:center;letter-spacing:3px;font-size:12px;margin:0;color:#64748b">RIGHTS INSTITUTE · PROSPER LEDGER</p>
<h1 style="text-align:center;margin:8px 0 4px">Certificate of Execution</h1>
<p style="text-align:center;margin:0 0 20px"><strong>${escapeHtml(agreement.certificateId)}</strong></p>
<p>This certifies that <strong>${escapeHtml(agreement.title)}</strong> was signed electronically by both parties:</p>
<table style="border-collapse:collapse;width:100%;font-size:14px">
${row('Employer', `${escapeHtml(agreement.employerName)} — ${escapeHtml(agreement.employerSignerName)}${agreement.employerSignerTitle ? `, ${escapeHtml(agreement.employerSignerTitle)}` : ''}<br>${escapeHtml(new Date(agreement.employerSignedAt).toUTCString())}`)}
${row('Employee', `${escapeHtml(agreement.seekerName)}<br>${escapeHtml(new Date(agreement.seekerSignedAt).toUTCString())}`)}
${row('Document hash', escapeHtml(agreement.documentHash))}
${row('Ledger block', `#${block.height}`)}
${row('Block hash', escapeHtml(block.blockHash))}
${row('Previous block', escapeHtml(block.prevHash))}
${anchor ? row('On-chain tx', anchor) : ''}
</table>
<p style="font-size:13px;color:#334155">The block hash chains this certificate to every certificate recorded before it,
so any later change to this or an earlier agreement is detectable.</p>
</div>
${button(certificateUrl, 'Verify the certificate')}
<p>The signed agreement is attached. You can also <a href="${escapeHtml(partyUrl)}">view it online</a>.</p>`),
    attachments: [
      {
        filename: `${agreement.certificateId}.html`,
        content: toBase64(renderSignedAgreementHtml(agreement, block)),
      },
    ],
  });
}
