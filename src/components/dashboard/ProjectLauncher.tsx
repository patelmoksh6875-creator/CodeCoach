import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const STARTERS = ['A calculator', 'A to-do list', 'A tip splitter', 'A color picker'];

interface ProjectLauncherProps {
  onGenerate: (idea: string) => void;
  isGenerating: boolean;
  error: string | null;
}

/** The "what do you want to build?" input + quick starters. */
export function ProjectLauncher({ onGenerate, isGenerating, error }: ProjectLauncherProps) {
  const [idea, setIdea] = useState('');

  const submit = () => {
    if (!idea.trim() || isGenerating) return;
    onGenerate(idea.trim());
  };

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-2xl font-semibold text-neutral-100">What do you want to build?</h1>
          <p className="text-sm text-neutral-500">
            Describe an app idea. CodeCoach generates it, then teaches you to read it.
          </p>
        </div>

        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="a calculator, a to-do list, a pomodoro timer..."
            rows={3}
            className="w-full resize-none bg-transparent text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
          />
          <div className="flex justify-end">
            <button
              onClick={submit}
              disabled={isGenerating || !idea.trim()}
              className="flex items-center gap-2 rounded bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-900 hover:bg-white disabled:opacity-40"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {isGenerating ? 'Generating…' : 'Build it'}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-400">{error}</p>}

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {STARTERS.map((s) => (
            <button
              key={s}
              onClick={() => setIdea(s)}
              className="rounded-full border border-neutral-800 px-3 py-1 text-xs text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
