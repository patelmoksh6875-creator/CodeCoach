import React, { useState } from 'react';

interface ProjectLauncherProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

export const ProjectLauncher: React.FC<ProjectLauncherProps> = ({ onGenerate, isLoading }) => {
  const [prompt, setPrompt] = useState('');

  const suggestions = [
    'Build a basic calculator',
    'Build a interactive to-do list',
    'Build a digital clock with alarm',
    'Build a simple memory flashcard game',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onGenerate(prompt.trim());
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-2xl w-full mx-auto">
      <h2 className="text-xl font-bold text-slate-100 mb-2">What do you want to build today?</h2>
      <p className="text-xs text-slate-400 mb-6">
        CodeCoach will generate a lightweight starter app and guide you through understanding how it works.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Build a weather app using fake data..."
            disabled={isLoading}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-xs rounded-lg transition-colors flex items-center space-x-1"
          >
            {isLoading ? <span>Generating...</span> : <span>Build & Learn →</span>}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-4 border-t border-slate-800/60">
        <span className="text-xs text-slate-500 font-medium">Quick Starters:</span>
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => {
                setPrompt(suggestion);
                onGenerate(suggestion);
              }}
              disabled={isLoading}
              className="text-xs bg-slate-800/60 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/50 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};