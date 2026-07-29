import React from 'react';
import { CoachIntervention } from '../../types/coach';
import { HintSystem } from './HintSystem';

interface CoachPanelProps {
  interventions: CoachIntervention[];
  activeHintStep: number;
  isAnalyzing: boolean;
  onHintStepChange: (step: number) => void;
  onTriggerBreakMode: () => void;
}

export const CoachPanel: React.FC<CoachPanelProps> = ({
  interventions,
  activeHintStep,
  isAnalyzing,
  onHintStepChange,
  onTriggerBreakMode,
}) => {
  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 h-full flex flex-col p-4 space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">🤖</span>
          <h3 className="text-sm font-bold text-slate-200">AI Live Mentor</h3>
        </div>
        <button
          onClick={onTriggerBreakMode}
          disabled={isAnalyzing}
          className="text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 px-2.5 py-1 rounded-md font-medium transition-colors"
        >
          ⚡ Break Mode
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {isAnalyzing && (
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-indigo-400 flex items-center space-x-2 animate-pulse">
            <span>Thinking...</span>
          </div>
        )}

        {interventions.length === 0 && !isAnalyzing && (
          <div className="text-center py-12 text-slate-500 text-xs">
            <p>I'm watching your code.</p>
            <p className="mt-1">Edit code, make errors, or trigger Break Mode to start learning!</p>
          </div>
        )}

        {interventions.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <h4 className="text-xs font-bold text-indigo-400">{item.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.message}</p>
            </div>

            {item.hints && (
              <HintSystem
                hints={item.hints}
                activeStep={activeHintStep}
                onStepChange={onHintStepChange}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};