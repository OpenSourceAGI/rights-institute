"use client";

import React from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { AgreementParagraph, newParagraphId } from './agreement-template';

interface ParagraphEditorProps {
  paragraphs: AgreementParagraph[];
  onChange: (paragraphs: AgreementParagraph[]) => void;
  /** Ids of paragraphs whose text differs from the original, highlighted for review. */
  changedIds?: Set<string>;
}

/** Every paragraph of the agreement as an editable heading + text block. */
export default function ParagraphEditor({ paragraphs, onChange, changedIds }: ParagraphEditorProps) {
  const update = (index: number, patch: Partial<AgreementParagraph>) =>
    onChange(paragraphs.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  const move = (index: number, delta: number) => {
    const next = [...paragraphs];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };
  const remove = (index: number) => onChange(paragraphs.filter((_, i) => i !== index));
  const add = (index: number) => {
    const next = [...paragraphs];
    next.splice(index + 1, 0, { id: newParagraphId(), heading: 'New clause', body: '' });
    onChange(next);
  };

  return (
    <ol className="space-y-4">
      {paragraphs.map((p, i) => (
        <li
          key={p.id}
          className={`rounded-lg border p-4 bg-slate-900 ${changedIds?.has(p.id) ? 'border-amber-400' : 'border-slate-700'}`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-slate-400 text-sm w-6">{i + 1}.</span>
            <input
              aria-label={`Paragraph ${i + 1} heading`}
              value={p.heading}
              onChange={(e) => update(i, { heading: e.target.value })}
              className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-slate-100 font-semibold"
            />
            {changedIds?.has(p.id) && <span className="text-xs text-amber-300">edited</span>}
            <button type="button" title="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">
              <ArrowUp className="w-4 h-4" />
            </button>
            <button type="button" title="Move down" disabled={i === paragraphs.length - 1} onClick={() => move(i, 1)} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">
              <ArrowDown className="w-4 h-4" />
            </button>
            <button type="button" title="Remove paragraph" disabled={paragraphs.length === 1} onClick={() => remove(i)} className="p-1 text-slate-400 hover:text-red-400 disabled:opacity-30">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            aria-label={`Paragraph ${i + 1} text`}
            value={p.body}
            rows={Math.min(12, Math.max(3, Math.ceil(p.body.length / 90)))}
            onChange={(e) => update(i, { body: e.target.value })}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 text-sm leading-relaxed"
          />
          <button type="button" onClick={() => add(i)} className="mt-2 text-xs text-slate-400 hover:text-white flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add paragraph below
          </button>
        </li>
      ))}
    </ol>
  );
}
