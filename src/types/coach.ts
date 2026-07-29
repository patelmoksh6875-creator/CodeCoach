export interface ExplainRequest {
  codeSnippet: string;
  context: 'function' | 'variable' | 'api' | 'component' | 'database';
  fileName: string;
}

export interface ExplanationResult {
  purpose: string;
  inputsAndOutputs: string;
  whereUsed: string;
  commonMistakes: string[];
}

export interface HintSequence {
  hint1: string; // Subtle nudge
  hint2: string; // Specific area to look at
  hint3: string; // Near-solution explanation
  solutionCode: string; // The explicit code fix
}

export interface BreakModeChallenge {
  promptToUser: string;
  targetFile: string;
  modificationInstruction: string;
  question: string; // "What do you think will happen when you click run?"
  options: string[]; // Multiple choice predictions
  correctOptionIndex: number;
  explanation: string;
}

export interface CoachIntervention {
  id: string;
  timestamp: number;
  type: 'explanation' | 'error_hint' | 'break_mode' | 'praise';
  title: string;
  message: string;
  hints?: HintSequence;
  breakChallenge?: BreakModeChallenge;
}