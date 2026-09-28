"use client";

/**
 * Employer side: opened from the invite link. Edit any paragraph, add the
 * employer's details, sign, and submit for the job seeker's countersignature.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, FileSignature, RotateCcw } from 'lucide-react';
import SignaturePadComponent from '../SignaturePad';
import ParagraphEditor from './ParagraphEditor';
import AgreementDocument, { AgreementRecord } from './AgreementDocument';
import { AgreementParagraph } from './agreement-template';
import { api } from './api';

type EmployerView = AgreementRecord & { editable: boolean; certificateUrl: string | null };

const inputClass = 'w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100';

export default function EmployerInvite({ token }: { token: string }) {
  const [agreement, setAgreement] = useState<EmployerView | null>(null);
  const [loadError, setLoadError] = useState('');
  const [paragraphs, setParagraphs] = useState<AgreementParagraph[]>([]);
  const [form, setForm] = useState({ employerName: '', employerEmail: '', signerName: '', signerTitle: '' });
  const [signature, setSignature] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // `?preview=1` lets the seeker look at their own link without it counting as opened.
    const preview = new URLSearchParams(window.location.search).get('preview') === '1';
    api<EmployerView>(`/api/agreement-invites/${encodeURIComponent(token)}${preview ? '?preview=1' : ''}`)
      .then((data) => {
        setAgreement(data);
        setParagraphs(data.paragraphs);
        setForm((f) => ({ ...f, employerName: data.employerName || '', employerEmail: data.employerEmail || '' }));
      })
      .catch((err) => setLoadError(err.message));
  }, [token]);

  const changedIds = useMemo(() => {
    const original = new Map((agreement?.paragraphs || []).map((p) => [p.id, p]));
    return new Set(
      paragraphs
        .filter((p) => {
          const o = original.get(p.id);
          return !o || o.heading !== p.heading || o.body !== p.body;
        })
        .map((p) => p.id)
    );
  }, [agreement, paragraphs]);

  if (loadError) return <p className="text-red-400 p-6">{loadError}</p>;
  if (!agreement) return <p className="text-slate-400 p-6">Loading agreement…</p>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signature) return setError('Please draw your signature.');
    if (!agree) return setError('Please confirm you agree to sign electronically.');
    setBusy(true);
    setError('');
    try {
      const data = await api<EmployerView>(`/api/agreement-invites/${encodeURIComponent(token)}`, {
        body: { ...form, paragraphs, signature, agree },
      });
      setAgreement(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!agreement.editable) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg bg-slate-900 border border-slate-700 p-4 flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
          {agreement.status === 'completed' ? (
            <div>
              <p className="font-semibold">Fully signed by both parties.</p>
              <p className="text-sm text-slate-400">
                Certificate <span className="font-mono">{agreement.certificateId}</span> was emailed to both of you.{' '}
                {agreement.certificateUrl && <a className="text-emerald-400 underline" href={agreement.certificateUrl}>View certificate</a>}
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold">You signed this agreement.</p>
              <p className="text-sm text-slate-400">
                {agreement.seekerName} has been asked to countersign. You'll both get the certificate by email when they do.
              </p>
            </div>
          )}
        </div>
        <AgreementDocument agreement={agreement} />
      </div>
    );
  }

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <form onSubmit={submit} className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{agreement.title}</h1>
        <p className="text-slate-400 text-sm mt-1">
          {agreement.seekerName} ({agreement.seekerEmail}) pre-filled this agreement for you. Change any paragraph you need
          to, then sign and submit. They'll review your final version before countersigning.
        </p>
      </header>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-300">
          {changedIds.size > 0 ? `${changedIds.size} paragraph(s) edited` : 'No changes yet'}
        </p>
        {changedIds.size > 0 && (
          <button type="button" onClick={() => setParagraphs(agreement.paragraphs)} className="text-sm text-slate-400 hover:text-white flex items-center gap-1">
            <RotateCcw className="w-4 h-4" /> Undo my edits
          </button>
        )}
      </div>
      <ParagraphEditor paragraphs={paragraphs} onChange={setParagraphs} changedIds={changedIds} />

      <section className="rounded-lg border border-slate-700 bg-slate-900 p-4 space-y-4">
        <h2 className="font-semibold flex items-center gap-2"><FileSignature className="w-5 h-5" /> Employer signature</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="block text-sm">Company / employer name *<input required value={form.employerName} onChange={set('employerName')} className={inputClass} /></label>
          <label className="block text-sm">Your email *<input required type="email" value={form.employerEmail} onChange={set('employerEmail')} className={inputClass} /></label>
          <label className="block text-sm">Your name *<input required value={form.signerName} onChange={set('signerName')} className={inputClass} /></label>
          <label className="block text-sm">Your title<input value={form.signerTitle} onChange={set('signerTitle')} placeholder="Head of People" className={inputClass} /></label>
        </div>
        <div className="bg-white rounded-lg">
          <SignaturePadComponent onSignatureChange={setSignature} label={`${form.signerName || 'Employer'} signature`} required />
        </div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1" />
          I have authority to sign for {form.employerName || 'the employer'}, I agree to sign this agreement electronically,
          and I understand my electronic signature is legally binding.
        </label>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" disabled={busy} className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50">
          {busy ? 'Submitting…' : 'Sign & submit for countersignature'}
        </button>
      </section>
    </form>
  );
}
