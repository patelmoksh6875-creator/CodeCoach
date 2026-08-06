import React, { useState } from 'react';
import { KeyRound } from 'lucide-react';

interface ApiKeyModalProps {
  onSubmit: (key: string) => void;
  onCancel?: () => void;
}

/** BYOK Groq key entry — stored client-side only, in localStorage, never sent anywhere but Groq. */
export function ApiKeyModal({ onSubmit, onCancel }: ApiKeyModalProps) {
  const [value, setValue] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-6 shadow-xl">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-neutral-100">
          <KeyRound size={16} />
          Groq API key required
        </div>
        <p className="mb-4 text-xs text-neutral-400">
          CodeCoach calls Groq directly from your browser (bring-your-own-key, no backend). Your
          key is stored only in this browser's local storage. Get a free key at{' '}
          <span className="text-neutral-300">console.groq.com/keys</span>.
        </p>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="gsk_..."
          className="mb-4 w-full rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none"
        />
        <div className="flex justify-end gap-2">
          {onCancel && (
            <button onClick={onCancel} className="rounded px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-200">
              Cancel
            </button>
          )}
          <button
            disabled={!value.trim()}
            onClick={() => onSubmit(value.trim())}
            className="rounded bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-900 disabled:opacity-40 hover:bg-white"
          >
            Save key
          </button>
        </div>
      </div>
    </div>
  );
}
