"use client";

/**
 * The job seeker's private tracker: whether the invite has been opened,
 * the full audit trail, and — once the employer signs — the countersign step.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Award, Check, Circle, Copy, Eye, Mail, RefreshCw } from 'lucide-react';
import SignaturePadComponent from '../SignaturePad';
import AgreementDocument, { AgreementRecord } from './AgreementDocument';
import { api, copyText, formatDate } from './api';

interface TrackerView extends AgreementRecord {
  tracking: { opened: boolean; openCount: number; firstOpenedAt: string | null; lastOpenedAt: string | null };
  events: { type: string; actor: string; detail: string | null; createdAt: string }[];
  links: { inviteUrl: string; trackerUrl: string; certificateUrl: string | null };
}

const EVENT_LABELS: Record<string, string> = {
  created: 'Invite created',
  invite_emailed: 'Invite emailed to employer',
  reminder_emailed: 'Reminder emailed to employer',
  invite_email_failed: 'Invite email could not be sent',
  link_opened: 'Employer opened the invite link',
  employer_edited: 'Employer edited paragraphs',
  employer_signed: 'Employer signed',
  countersign_emailed: 'You were emailed to countersign',
  seeker_signed: 'You countersigned',
  ledger_recorded: 'Recorded on the Prosper ledger',
  anchored_onchain: 'Anchored on-chain',
  certificate_emailed: 'Certificate emailed to both parties',
};

const STEPS = [
  { key: 'sent', label: 'Invite sent' },
  { key: 'opened', label: 'Link opened' },
  { key: 'employer_signed', label: 'Employer signed' },
  { key: 'completed', label: 'Both signed' },
];

export default function AgreementTracker({ id, accessKey }: { id: string; accessKey: string }) {
  const [data, setData] = useState<TrackerView | null>(null);
  const [error, setError] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(() => {
    api<TrackerView>(`/api/agreements/${encodeURIComponent(id)}?k=${encodeURIComponent(accessKey)}`)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [id, accessKey]);

  useEffect(() => {
    load();
    // Poll while waiting on the employer so "opened" and "signed" appear live.
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') load();
    }, 20000);
    return () => clearInterval(timer);
  }, [load]);

  if (error) return <p className="text-red-400 p-6">{error}</p>;
  if (!data) return <p className="text-slate-400 p-6">Loading tracker…</p>;

  const reached = STEPS.findIndex((s) => s.key === data.status);
  const waitingOnEmployer = data.status === 'sent' || data.status === 'opened';

  const remind = async () => {
    setBusy(true);
    setActionError('');
    try {
      setData(await api<TrackerView>(`/api/agreements/${encodeURIComponent(id)}/remind`, { body: { k: accessKey } }));
      setNotice('Reminder sent.');
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const countersign = async () => {
    if (!signature) return setActionError('Please draw your signature.');
    if (!agree) return setActionError('Please confirm you agree to sign electronically.');
    setBusy(true);
    setActionError('');
    try {
      setData(
        await api<TrackerView>(`/api/agreements/${encodeURIComponent(id)}/sign`, {
          body: { k: accessKey, signature, agree, contentHash: data.contentHash },
        })
      );
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <p className="text-slate-400 text-sm">Tracker for {data.seekerName} · keep this link private</p>
        </div>
        <button type="button" onClick={load} className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </header>

      <ol className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {STEPS.map((s, i) => (
          <li key={s.key} className={`rounded-lg p-3 text-sm flex items-center gap-2 ${i <= reached ? 'bg-emerald-900/50 text-emerald-200' : 'bg-slate-900 text-slate-500'}`}>
            {i <= reached ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />} {s.label}
          </li>
        ))}
      </ol>

      <section className="rounded-lg border border-slate-700 bg-slate-900 p-4 grid md:grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-slate-400 flex items-center gap-1"><Eye className="w-4 h-4" /> Link clicked?</p>
          <p className="text-lg font-semibold">{data.tracking.opened ? `Yes — ${data.tracking.openCount} time(s)` : 'Not yet'}</p>
        </div>
        <div>
          <p className="text-slate-400">First opened</p>
          <p>{formatDate(data.tracking.firstOpenedAt)}</p>
        </div>
        <div>
          <p className="text-slate-400">Last opened</p>
          <p>{formatDate(data.tracking.lastOpenedAt)}</p>
        </div>
      </section>

      {waitingOnEmployer && (
        <section className="rounded-lg border border-slate-700 bg-slate-900 p-4 space-y-3">
          <p className="text-sm text-slate-300">Invite link for {data.employerName || 'your employer'}:</p>
          <div className="flex gap-2">
            <input readOnly value={data.links.inviteUrl} className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 font-mono text-xs" />
            <button type="button" onClick={async () => setNotice((await copyText(data.links.inviteUrl)) ? 'Invite link copied.' : '')} className="px-3 rounded bg-slate-600 hover:bg-slate-500 flex items-center gap-1 text-sm">
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {data.employerEmail && (
              <button type="button" disabled={busy} onClick={remind} className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 flex items-center gap-1 disabled:opacity-50">
                <Mail className="w-4 h-4" /> Email reminder to {data.employerEmail}
              </button>
            )}
            <a href={`${data.links.inviteUrl}?preview=1`} target="_blank" rel="noreferrer" className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700">
              Preview what they see
            </a>
          </div>
          {notice && <p className="text-emerald-400 text-sm">{notice}</p>}
          {actionError && <p className="text-red-400 text-sm">{actionError}</p>}
        </section>
      )}

      {data.status === 'completed' && data.links.certificateUrl && (
        <section className="rounded-lg border-2 border-emerald-500 bg-emerald-950/40 p-4 flex flex-wrap items-center gap-4">
          <Award className="w-8 h-8 text-emerald-400" />
          <div className="flex-1">
            <p className="font-semibold">Fully signed · Certificate {data.certificateId}</p>
            <p className="text-xs font-mono text-slate-400 break-all">Document hash {data.documentHash}</p>
          </div>
          <a href={data.links.certificateUrl} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold text-sm">View certificate</a>
        </section>
      )}

      {data.status !== 'sent' && data.status !== 'opened' && <AgreementDocument agreement={data} />}

      {data.status === 'employer_signed' && (
        <section className="rounded-lg border border-slate-700 bg-slate-900 p-4 space-y-4">
          <h2 className="font-semibold">Countersign</h2>
          <p className="text-sm text-slate-400">
            Review the final agreement above — {data.events.some((e) => e.type === 'employer_edited') ? 'your employer edited some paragraphs' : 'your employer made no edits'}.
            Signing records it on the Prosper ledger and emails the certificate to both of you.
          </p>
          <div className="bg-white rounded-lg">
            <SignaturePadComponent onSignatureChange={setSignature} label={`${data.seekerName} signature`} required />
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
            I have reviewed the final agreement, I agree to sign it electronically, and I understand my electronic signature is legally binding.
          </label>
          {actionError && <p className="text-red-400 text-sm">{actionError}</p>}
          <button type="button" disabled={busy} onClick={countersign} className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold disabled:opacity-50">
            {busy ? 'Signing…' : 'Sign & issue certificate'}
          </button>
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-2">Activity</h2>
        <ul className="text-sm space-y-1">
          {data.events.map((e, i) => (
            <li key={i} className="flex gap-3">
              <span className="text-slate-500 w-44 shrink-0">{formatDate(e.createdAt)}</span>
              <span>{EVENT_LABELS[e.type] || e.type}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
