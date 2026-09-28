"use client";

/**
 * Job seeker side of the invite flow: pre-fill the agreement, adjust any
 * paragraph, then get an invite link to copy or email to the employer, plus
 * a private tracker link.
 */

import React, { useEffect, useState } from 'react';
import { Check, Copy, ExternalLink, Mail, Send } from 'lucide-react';
import ParagraphEditor from './ParagraphEditor';
import {
  AgreementParagraph,
  EMPTY_ANSWERS,
  SeekerAnswers,
  agreementTitle,
  buildEmploymentParagraphs,
} from './agreement-template';
import { api, copyText } from './api';

const RECENT_KEY = 'rights.agreementInvites';

interface Created {
  id: string;
  inviteUrl: string;
  trackerUrl: string;
  emailSent: boolean;
  trackerEmailed: boolean;
}

interface RecentInvite {
  id: string;
  title: string;
  employerName: string;
  trackerUrl: string;
  createdAt: string;
}

function loadRecent(): RecentInvite[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveRecent(list: RecentInvite[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    // Private mode or storage blocked — the tracker link is still emailed and shown.
  }
}

const inputClass = 'w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 placeholder:text-slate-500';

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-sm text-slate-300 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

function CopyRow({ label, url, hint }: { label: string; url: string; hint: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-slate-700 p-4 bg-slate-900">
      <p className="text-sm font-semibold text-slate-100">{label}</p>
      <p className="text-xs text-slate-400 mb-2">{hint}</p>
      <div className="flex gap-2">
        <input readOnly value={url} onFocus={(e) => e.target.select()} className={`${inputClass} font-mono text-xs`} />
        <button
          type="button"
          onClick={async () => {
            if (await copyText(url)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }
          }}
          className="px-3 rounded bg-slate-600 hover:bg-slate-500 text-white flex items-center gap-1 text-sm whitespace-nowrap"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default function JobSeekerInvite() {
  const [step, setStep] = useState<'details' | 'review' | 'sent'>('details');
  const [answers, setAnswers] = useState<SeekerAnswers>(EMPTY_ANSWERS);
  const [paragraphs, setParagraphs] = useState<AgreementParagraph[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<Created | null>(null);
  const [recent, setRecent] = useState<RecentInvite[]>([]);

  useEffect(() => setRecent(loadRecent()), []);

  const set = (field: keyof SeekerAnswers) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAnswers((prev) => ({ ...prev, [field]: e.target.value }));

  const toReview = (e: React.FormEvent) => {
    e.preventDefault();
    setParagraphs(buildEmploymentParagraphs(answers));
    setTitle(agreementTitle(answers));
    setError('');
    setStep('review');
  };

  const create = async () => {
    setBusy(true);
    setError('');
    try {
      const result = await api<Created>('/api/agreements', {
        body: {
          title,
          paragraphs,
          message,
          sendEmail: sendEmail && Boolean(answers.employerEmail.trim()),
          seekerName: answers.seekerName,
          seekerEmail: answers.seekerEmail,
          employerName: answers.employerName,
          employerEmail: answers.employerEmail,
        },
      });
      setCreated(result);
      const next = [
        { id: result.id, title, employerName: answers.employerName, trackerUrl: result.trackerUrl, createdAt: new Date().toISOString() },
        ...recent,
      ];
      setRecent(next);
      saveRecent(next);
      setStep('sent');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 rounded-lg p-6 space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Invite your employer to sign</h2>
        <p className="text-slate-400 text-sm mt-1">
          Pre-fill your employment agreement, send your employer a link, and track when they open it. They can edit
          any paragraph, then sign; you countersign, and both of you receive a certificate recorded on the Prosper ledger.
        </p>
        <ol className="flex flex-wrap gap-2 mt-4 text-xs">
          {['1. Your details', '2. Review paragraphs', '3. Share invite'].map((label, i) => (
            <li
              key={label}
              className={`px-3 py-1 rounded-full ${['details', 'review', 'sent'].indexOf(step) >= i ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400'}`}
            >
              {label}
            </li>
          ))}
        </ol>
      </header>

      {step === 'details' && (
        <form onSubmit={toReview} className="space-y-6">
          <section className="grid md:grid-cols-2 gap-4">
            <Field label="Your full name *"><input required value={answers.seekerName} onChange={set('seekerName')} className={inputClass} /></Field>
            <Field label="Your email *" hint="Your private tracker link and certificate are sent here.">
              <input required type="email" value={answers.seekerEmail} onChange={set('seekerEmail')} className={inputClass} />
            </Field>
            <Field label="Employer / company name"><input value={answers.employerName} onChange={set('employerName')} className={inputClass} /></Field>
            <Field label="Employer contact email" hint="Optional — needed only to email the invite for you.">
              <input type="email" value={answers.employerEmail} onChange={set('employerEmail')} className={inputClass} />
            </Field>
          </section>

          <section className="grid md:grid-cols-3 gap-4">
            <Field label="Position / job title *"><input required value={answers.position} onChange={set('position')} className={inputClass} /></Field>
            <Field label="Employment type">
              <select value={answers.employmentType} onChange={set('employmentType')} className={inputClass}>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract-to-hire">Contract-to-hire</option>
              </select>
            </Field>
            <Field label="Start date"><input type="date" value={answers.startDate} onChange={set('startDate')} className={inputClass} /></Field>
            <Field label="Salary / rate"><input placeholder="$85,000 per year" value={answers.salary} onChange={set('salary')} className={inputClass} /></Field>
            <Field label="Pay frequency">
              <select value={answers.payFrequency} onChange={set('payFrequency')} className={inputClass}>
                {['weekly', 'bi-weekly', 'semi-monthly', 'monthly'].map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Hours per week"><input value={answers.hoursPerWeek} onChange={set('hoursPerWeek')} className={inputClass} /></Field>
            <Field label="Work location"><input placeholder="remotely / at the Austin office" value={answers.workLocation} onChange={set('workLocation')} className={inputClass} /></Field>
            <Field label="Benefits"><input placeholder="health, dental, 401(k) match" value={answers.benefits} onChange={set('benefits')} className={inputClass} /></Field>
            <Field label="Paid time off"><input placeholder="15 days" value={answers.paidTimeOff} onChange={set('paidTimeOff')} className={inputClass} /></Field>
            <Field label="Introductory period (days)"><input value={answers.probationDays} onChange={set('probationDays')} className={inputClass} /></Field>
            <Field label="Termination notice (days)"><input value={answers.noticeDays} onChange={set('noticeDays')} className={inputClass} /></Field>
            <Field label="Governing state / jurisdiction"><input value={answers.governingState} onChange={set('governingState')} className={inputClass} /></Field>
          </section>

          <button type="submit" className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold">
            Continue to review
          </button>
        </form>
      )}

      {step === 'review' && (
        <div className="space-y-6">
          <Field label="Agreement title"><input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} /></Field>
          <p className="text-sm text-slate-400">
            Edit anything below. Your employer can change these paragraphs too before signing, and you'll review their final
            version before you countersign.
          </p>
          <ParagraphEditor paragraphs={paragraphs} onChange={setParagraphs} />

          <div className="rounded-lg border border-slate-700 p-4 bg-slate-900 space-y-3">
            <Field label="Note to your employer (optional)">
              <textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} className={inputClass} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={sendEmail && Boolean(answers.employerEmail.trim())} disabled={!answers.employerEmail.trim()} onChange={(e) => setSendEmail(e.target.checked)} />
              {answers.employerEmail.trim()
                ? `Email the invite to ${answers.employerEmail.trim()}`
                : 'Add an employer email on the previous step to have us email the invite'}
            </label>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep('details')} className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600">Back</button>
            <button type="button" disabled={busy} onClick={create} className="px-5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-2 disabled:opacity-50">
              <Send className="w-4 h-4" /> {busy ? 'Creating…' : 'Create invite link'}
            </button>
          </div>
        </div>
      )}

      {step === 'sent' && created && (
        <div className="space-y-4">
          <p className="flex items-center gap-2 text-emerald-400 font-semibold"><Check className="w-5 h-5" /> Your invite is ready.</p>
          {created.emailSent && (
            <p className="text-sm text-slate-300 flex items-center gap-2"><Mail className="w-4 h-4" /> Emailed to {answers.employerEmail}.</p>
          )}
          <CopyRow label="Invite link for your employer" url={created.inviteUrl} hint="Send this to your employer. Anyone with it can edit and sign as the employer." />
          <CopyRow
            label="Your private tracker link"
            url={created.trackerUrl}
            hint={`Keep this private. It shows when the invite is opened, and it's where you countersign.${created.trackerEmailed ? ` Also emailed to ${answers.seekerEmail}.` : ''}`}
          />
          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${encodeURIComponent(answers.employerEmail)}?subject=${encodeURIComponent(`Please review and sign: ${title}`)}&body=${encodeURIComponent(`Hi,\n\nI've prepared our employment agreement. You can edit any paragraph and sign it here:\n${created.inviteUrl}\n\nThanks,\n${answers.seekerName}`)}`} className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4" /> Send from my own email
            </a>
            <a href={created.trackerUrl} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2 text-sm font-semibold">
              <ExternalLink className="w-4 h-4" /> Open tracker
            </a>
            <button type="button" onClick={() => { setCreated(null); setAnswers(EMPTY_ANSWERS); setStep('details'); }} className="px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-sm">
              Start another
            </button>
          </div>
        </div>
      )}

      {recent.length > 0 && step !== 'sent' && (
        <section className="border-t border-slate-800 pt-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Your invites on this device</h3>
          <ul className="space-y-1 text-sm">
            {recent.map((r) => (
              <li key={r.id}>
                <a href={r.trackerUrl} className="text-emerald-400 hover:underline">{r.title}</a>
                <span className="text-slate-500"> {r.employerName && `· ${r.employerName} `}· {new Date(r.createdAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
