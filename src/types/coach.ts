export interface ExplanationResult {
  purpose: string;
  inputsAndOutputs: string;
  whereUsed: string;
  commonMistakes: string[];
}

export interface HintSequence {
  hint1: string; // subtle nudge
  hint2: string; // specific area to look at
  hint3: string; // near-solution explanation
  solutionCode: string; // explicit fix
}

export interface BreakModeChallenge {
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

/** A single step in the AI's guided plan for a feature the learner wants to add.
 *  Steps reveal progressively, same shape/spirit as HintSequence but for building
 *  forward instead of debugging. */
export interface GuidedBuildStep {
  stepNumber: number;
  title: string;
  guidance: string; // a nudge/question, never the finished code
  codeHint?: string; // an optional short illustrative fragment, NOT a full solution
}

export interface GuidedBuildPlan {
  featureSummary: string;
  steps: GuidedBuildStep[];
  /** Only revealed once the learner has stepped through every hint. */
  finalSolutionNote: string;
}

export type LiveEditKind = 'deletion' | 'modification' | 'incomplete-addition';

export interface LiveEditFeedback {
  kind: LiveEditKind;
  message: string;
}

export type InterventionType =
  | 'explanation'
  | 'error_hint'
  | 'break_mode'
  | 'live_edit'
  | 'guided_build'
  | 'praise';

export interface CoachIntervention {
  id: string;
  timestamp: number;
  type: InterventionType;
  title: string;
  message: string;
}
