import React, { useState } from 'react';
import { MessageSquare, Zap, Wand2, Loader2 } from 'lucide-react';
import type { CoachIntervention } from '../../types/coach';

interface CoachPanelProps {
  interventions: CoachIntervention[];
  isBusy: boolean;
  onTriggerBreakMode: () => void;
  onRequestGuidedBuild: (featureRequest: string) => void;
}

/** Right-hand dock: feed of AI interventions, Break Mode trigger, and the guided-add input. */
export function CoachPanel({ interventions, isBusy, onTriggerBreakMode, onRequestGuidedBuild }: CoachPanelProps) {
  const [featureText, setFeatureText] = useState('');

  const submitGuidedBuild = () => {
    if (!featureText.trim()) return;
    onRequestGuidedBuild(featureText.trim());
    setFeatureText('');
  };

  return (
    <div className="flex h-full w-80 flex-col border-l border-neutral-800 bg-neutral-950">
      <div className="border-b border-neutral-800 px-4 py-3">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-100">
          <MessageSquare size={16} />
          Coach
        </div>

        <button
          onClick={onTriggerBreakMode}
          disabled={isBusy}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-200 hover:border-neutral-500 disabled:opacity-40"
        >
          <Zap size={14} className="text-amber-400" />
          Test my understanding
        </button>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
            <Wand2 size={13} />
            Want to add something? Describe it, get guided hints.
          </label>
          <textarea
            value={featureText}
            onChange={(e) => setFeatureText(e.target.value)}
            placeholder='e.g. "a reset button that clears the total"'
            rows={2}
            className="w-full resize-none rounded border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none"
          />
          <button
            onClick={submitGuidedBuild}
            disabled={isBusy || !featureText.trim()}
            className="flex w-full items-center justify-center gap-2 rounded bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-white disabled:opacity-40"
          >
            {isBusy ? <Loader2 size={14} className="animate-spin" /> : 'Get a guided plan'}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {interventions.length === 0 && (
          <p className="text-xs text-neutral-600">
            The coach will react here as you highlight code, edit files, and hit errors.
          </p>
        )}
        {interventions.map((i) => (
          <div key={i.id} className="rounded border border-neutral-800 bg-neutral-900 px-3 py-2">
            <div className="mb-0.5 text-xs font-semibold text-neutral-200">{i.title}</div>
            <p className="text-xs text-neutral-400">{i.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
