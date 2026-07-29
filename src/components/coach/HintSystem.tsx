import React from 'react';
import { HintSequence } from '../../types/coach';

interface HintSystemProps {
  hints: HintSequence;
  activeStep: number;
  onStepChange: (step: number) => void;
}

export const HintSystem: React.FC<HintSystemProps> = ({ hints, activeStep, onStepChange }) => {
  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Guided Debugging Hints
        </h4>
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((step) => (
            <button
              key={step}
              onClick={() => onStepChange(step)}
              className={`w-6 h-6 rounded-full text-xs font-bold transition-all ${
                activeStep === step
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              {step === 4 ? '✓' : step}
            </button>
          ))}
        </div>
      </div>

      <div className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
        {activeStep === 1 && <p>💡 <strong>Hint 1:</strong> {hints.hint1}</p>}
        {activeStep === 2 && <p>🔍 <strong>Hint 2:</strong> {hints.hint2}</p>}
        {activeStep === 3 && <p>🎯 <strong>Hint 3:</strong> {hints.hint3}</p>}
        {activeStep === 4 && (
          <div>
            <p className="text-emerald-400 font-semibold mb-2">Solution Code:</p>
            <pre className="text-xs font-mono bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto text-emerald-300">
              {hints.solutionCode}
            </pre>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center text-xs">
        <button
          disabled={activeStep <= 1}
          onClick={() => onStepChange(activeStep - 1)}
          className="text-slate-400 disabled:opacity-30 hover:text-white"
        >
          ← Previous
        </button>
        <button
          disabled={activeStep >= 4}
          onClick={() => onStepChange(activeStep + 1)}
          className="text-indigo-400 font-semibold disabled:opacity-30 hover:text-indigo-300"
        >
          {activeStep === 3 ? 'Reveal Solution →' : 'Next Hint →'}
        </button>
      </div>
    </div>
  );
};