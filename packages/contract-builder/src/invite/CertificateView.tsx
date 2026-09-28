"use client";

/** Public certificate page: who signed, when, and a live check against the Prosper ledger. */

import React, { useEffect, useState } from 'react';
import { Award, ShieldAlert, ShieldCheck } from 'lucide-react';
import { api, formatDate } from './api';

interface Certificate {
  certificateId: string;
  title: string;
  employer: { name: string; signerName: string; signerTitle: string | null; signedAt: string };
  employee: { name: string; signedAt: string };
  documentHash: string;
  block: {
    height: number;
    blockHash: string;
    prevHash: string;
    nextHash: string | null;
    timestamp: number;
    anchorTxHash: string | null;
    anchorChainId: number | null;
    explorerUrl: string | null;
  };
  ledger: { height: number; tip: string | null };
  verified: boolean;
  checks: Record<string, boolean>;
}

const CHECK_LABELS: Record<string, string> = {
  contentHash: 'Agreement text matches what the employer signed',
  documentHash: 'Signed document matches the ledger entry',
  blockHash: 'Ledger block hash recomputes correctly',
  linkedToNext: 'Next block links back to this one',
  chainValid: 'Entire Prosper ledger verifies',
};

function Row({ label, children, mono }: { label: string; children: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid md:grid-cols-[180px_1fr] gap-1 py-2 border-b border-slate-200">
      <dt className="text-slate-500 text-sm">{label}</dt>
      <dd className={mono ? 'font-mono text-xs break-all' : ''}>{children}</dd>
    </div>
  );
}

export default function CertificateView({ certificateId }: { certificateId: string }) {
  const [cert, setCert] = useState<Certificate | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Certificate>(`/api/certificates/${encodeURIComponent(certificateId)}`).then(setCert).catch((e) => setError(e.message));
  }, [certificateId]);

  if (error) return <p className="text-red-400 p-6">{error}</p>;
  if (!cert) return <p className="text-slate-400 p-6">Verifying certificate…</p>;

  return (
    <div className="bg-white text-slate-900 rounded-lg p-6 md:p-10 border-4 border-double border-slate-800">
      <p className="text-center tracking-[0.3em] text-xs text-slate-500">RIGHTS INSTITUTE · PROSPER LEDGER</p>
      <h1 className="text-3xl font-serif font-bold text-center mt-2 flex items-center justify-center gap-2">
        <Award className="w-8 h-8" /> Certificate of Execution
      </h1>
      <p className="text-center font-mono font-semibold mt-1">{cert.certificateId}</p>

      <div className={`mt-6 rounded-lg p-3 flex items-center gap-2 ${cert.verified ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
        {cert.verified ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
        <span className="font-semibold">{cert.verified ? 'Verified — this certificate is intact.' : 'Verification failed — this record has been altered.'}</span>
      </div>

      <p className="mt-6">
        This certifies that <strong>{cert.title}</strong> was signed electronically by both parties.
      </p>
      <dl className="mt-4">
        <Row label="Employer">
          {cert.employer.name} — {cert.employer.signerName}{cert.employer.signerTitle ? `, ${cert.employer.signerTitle}` : ''}
          <span className="block text-sm text-slate-500">Signed {formatDate(cert.employer.signedAt)}</span>
        </Row>
        <Row label="Employee">
          {cert.employee.name}
          <span className="block text-sm text-slate-500">Signed {formatDate(cert.employee.signedAt)}</span>
        </Row>
        <Row label="Document hash" mono>{cert.documentHash}</Row>
        <Row label="Ledger block">#{cert.block.height} · recorded {formatDate(cert.block.timestamp)}</Row>
        <Row label="Block hash" mono>{cert.block.blockHash}</Row>
        <Row label="Previous block" mono>{cert.block.prevHash}</Row>
        {cert.block.nextHash && <Row label="Next block" mono>{cert.block.nextHash}</Row>}
        <Row label="On-chain anchor" mono>
          {cert.block.anchorTxHash ? (
            cert.block.explorerUrl ? <a className="underline" href={cert.block.explorerUrl}>{cert.block.anchorTxHash}</a> : cert.block.anchorTxHash
          ) : (
            'Not anchored'
          )}
        </Row>
        <Row label="Ledger tip" mono>{cert.ledger.tip} ({cert.ledger.height} blocks)</Row>
      </dl>

      <ul className="mt-6 space-y-1 text-sm">
        {Object.entries(cert.checks).map(([key, ok]) => (
          <li key={key} className={ok ? 'text-emerald-700' : 'text-red-700'}>{ok ? '✓' : '✗'} {CHECK_LABELS[key] || key}</li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-slate-500">
        Each ledger block's hash commits to the block before it, so the chain tip fingerprints every agreement recorded so far.
        The agreement text and signatures are held only by the two parties.
      </p>
    </div>
  );
}
