import React from 'react';
import { SessionSummaryData } from '../../types/knowledge';

interface SessionSummaryProps {
  summary: SessionSummaryData;
  onClose: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({ summary, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center">
          <span className="text-3xl">🎉</span>
          <h3 className="text-xl font-bold text-slate-100 mt-2">Session Complete!</h3>
          <p className="text-xs text-slate-400 mt-1">{summary.summaryNote}</p>
        </div>

        <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Learned</h4>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {summary.learnedConcepts.map((item) => (
                <span key={item} className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
                  ✓ {item}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Needs Work</h4>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {summary.needsWorkConcepts.map((item) => (
                <span key={item} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-md">
                  • {item}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Recommended Next Topic</h4>
            <p className="text-xs text-indigo-200 font-semibold mt-1">🚀 {summary.recommendedNextTopic}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};