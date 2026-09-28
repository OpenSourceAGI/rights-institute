"use client";

import React from 'react';
import { AgreementParagraph } from './agreement-template';
import { formatDate } from './api';

export interface AgreementRecord {
  id: string;
  title: string;
  status: 'sent' | 'opened' | 'employer_signed' | 'completed' | 'declined';
  paragraphs: AgreementParagraph[];
  seekerName: string;
  seekerEmail: string;
  employerName: string | null;
  employerEmail: string | null;
  employerSignerName: string | null;
  employerSignerTitle: string | null;
  employerSignature: string | null;
  employerSignedAt: string | null;
  seekerSignature: string | null;
  seekerSignedAt: string | null;
  contentHash: string | null;
  documentHash: string | null;
  certificateId: string | null;
}

function SignatureBlock({ label, name, title, image, signedAt }: { label: string; name: string | null; title?: string | null; image: string | null; signedAt: string | null }) {
  return (
    <div className="flex-1 min-w-[220px]">
      <p className="font-semibold mb-1">{label}</p>
      {image ? (
        <img src={image} alt={`${label} signature`} className="h-20 object-contain border-b border-slate-400" />
      ) : (
        <div className="h-20 border-b-2 border-dashed border-slate-400 flex items-end pb-1 text-slate-400 text-sm">Awaiting signature</div>
      )}
      <p className="mt-1 text-sm">{name || '—'}{title ? `, ${title}` : ''}</p>
      {signedAt && <p className="text-xs text-slate-500">Signed {formatDate(signedAt)}</p>}
    </div>
  );
}

/** Read-only rendering of an agreement with both signature lines. */
export default function AgreementDocument({ agreement }: { agreement: AgreementRecord }) {
  return (
    <article className="bg-white text-slate-900 rounded-lg p-6 md:p-10 font-serif leading-relaxed">
      <h2 className="text-2xl font-bold text-center mb-6">{agreement.title}</h2>
      <p className="mb-6">
        Between <strong>{agreement.employerName || 'the Employer'}</strong> ("Employer") and{' '}
        <strong>{agreement.seekerName}</strong> ("Employee").
      </p>
      {agreement.paragraphs.map((p, i) => (
        <section key={p.id} className="mb-4">
          <h3 className="font-bold">{i + 1}. {p.heading}</h3>
          <p className="whitespace-pre-wrap">{p.body}</p>
        </section>
      ))}
      <div className="flex flex-wrap gap-8 mt-10">
        <SignatureBlock label="Employer" name={agreement.employerSignerName} title={agreement.employerSignerTitle} image={agreement.employerSignature} signedAt={agreement.employerSignedAt} />
        <SignatureBlock label="Employee" name={agreement.seekerName} image={agreement.seekerSignature} signedAt={agreement.seekerSignedAt} />
      </div>
      {agreement.contentHash && (
        <p className="mt-8 text-xs font-mono text-slate-500 break-all">Content hash (SHA-256): {agreement.contentHash}</p>
      )}
    </article>
  );
}
