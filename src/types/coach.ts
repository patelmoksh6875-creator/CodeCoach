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
  /** A short, near-verbatim snippet (a line or two) already present in the current
   *  file that this step is about — used to locate and highlight the right spot in
   *  the live editor for tutor mode. Omit if the step isn't tied to an existing line
   *  (e.g. "add a new file"). */
  targetAnchor?: string;
}

export interface GuidedBuildPlan {
  featureSummary: string;
  steps: GuidedBuildStep[];
  /** Only revealed once the learner has stepped through every hint. */
  finalSolutionNote: string;
}

/** The result of asking the AI to just implement a guided-build plan directly,
 *  instead of walking the learner through it. Full file contents, ready to write
 *  straight into the project. */
export interface GuidedBuildImplementation {
  /** Short note on what was changed, shown as confirmation. */
  changeSummary: string;
  /** Map of file path -> full new file contents, for every file that changed. */
  updatedFiles: Record<string, string>;
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
