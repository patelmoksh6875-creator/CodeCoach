export type MasteryLevel = 'mastered' | 'learning' | 'unexplored'; // ✅, 🟨, ⬜

export interface ConceptNode {
  id: string;
  name: string;
  category: 'HTML' | 'CSS' | 'JavaScript' | 'DOM' | 'Async';
  status: MasteryLevel;
  description: string;
}

export interface KnowledgeGraphData {
  nodes: Record<string, ConceptNode>;
}

export interface SessionActivity {
  timestamp: number;
  type: 'code_edit' | 'error_fixed' | 'explain_viewed' | 'break_mode_passed';
  conceptId?: string;
  details: string;
}

export interface SessionSummaryData {
  durationMinutes: number;
  learnedConcepts: string[];
  needsWorkConcepts: string[];
  recommendedNextTopic: string;
  summaryNote: string;
}