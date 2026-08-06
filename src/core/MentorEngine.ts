import type { AIService } from './AIService';
import {
  EXPLAIN_CODE_SYSTEM_PROMPT,
  DEBUG_HINTS_SYSTEM_PROMPT,
  BREAK_MODE_SYSTEM_PROMPT,
  GUIDED_BUILD_SYSTEM_PROMPT,
} from '../prompts/prompts';
import type {
  ExplanationResult,
  HintSequence,
  BreakModeChallenge,
  GuidedBuildPlan,
} from '../types/coach';

/** All the "coach reacting to what the learner is doing" AI calls, grouped in one class. */
export class MentorEngine {
  constructor(private ai: AIService) {}

  async explainSnippet(snippet: string, fileName: string): Promise<ExplanationResult> {
    return this.ai.completeJSON<ExplanationResult>(
      EXPLAIN_CODE_SYSTEM_PROMPT,
      `File: ${fileName}\n\nHighlighted snippet:\n\`\`\`\n${snippet}\n\`\`\``
    );
  }

  async generateDebugHints(errorMessage: string, fileContents: string): Promise<HintSequence> {
    return this.ai.completeJSON<HintSequence>(
      DEBUG_HINTS_SYSTEM_PROMPT,
      `Error:\n${errorMessage}\n\nFile contents:\n\`\`\`\n${fileContents}\n\`\`\``
    );
  }

  async createBreakChallenge(fileContents: string): Promise<BreakModeChallenge> {
    return this.ai.completeJSON<BreakModeChallenge>(
      BREAK_MODE_SYSTEM_PROMPT,
      `File contents:\n\`\`\`\n${fileContents}\n\`\`\``
    );
  }

  async createGuidedBuildPlan(featureRequest: string, fileContents: string): Promise<GuidedBuildPlan> {
    return this.ai.completeJSON<GuidedBuildPlan>(
      GUIDED_BUILD_SYSTEM_PROMPT,
      `The learner wants to add: "${featureRequest}"\n\nCurrent file contents:\n\`\`\`\n${fileContents}\n\`\`\``
    );
  }
}
