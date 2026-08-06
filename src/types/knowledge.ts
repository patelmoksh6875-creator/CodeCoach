export interface SessionActivity {
  timestamp: number;
  type: 'code_edit' | 'error_fixed' | 'explain_viewed' | 'break_mode_passed' | 'guided_build';
  details: string;
}

export interface SessionSummaryData {
  learnedConcepts: string[];
  needsWorkConcepts: string[];
  recommendedNextTopic: string;
  summaryNote: string;
}

/** A single explained snippet, persisted so the learner can revisit it later. */
export interface GalleryItem {
  id: string;
  timestamp: number;
  projectTitle: string;
  fileName: string;
  codeSnippet: string;
  explanation: ExplanationResultRef;
}

// avoid circular import weirdness while keeping the shape obvious
import type { ExplanationResult as ExplanationResultRef } from './coach';
