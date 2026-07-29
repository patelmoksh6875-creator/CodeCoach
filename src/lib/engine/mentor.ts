import { callAI, AIClientConfig } from '../ai/client';
import { 
  LIVE_MENTOR_SYSTEM_PROMPT, 
  EXPLAIN_ANYTHING_SYSTEM_PROMPT, 
  BREAK_MODE_SYSTEM_PROMPT 
} from '../ai/prompts';
import { 
  ExplanationResult, 
  HintSequence, 
  BreakModeChallenge, 
  ExplainRequest 
} from '../../types/coach';

export async function explainCode(
  req: ExplainRequest,
  config?: AIClientConfig
): Promise<ExplanationResult> {
  const userPrompt = `
File: ${req.fileName}
Type: ${req.context}
Code:
\`\`\`
${req.codeSnippet}
\`\`\`
Explain this code element for a beginner.
  `;

  const response = await callAI(EXPLAIN_ANYTHING_SYSTEM_PROMPT, userPrompt, config);
  return JSON.parse(response);
}

export async function generateDebugHints(
  errorMessage: string,
  codeContext: string,
  config?: AIClientConfig
): Promise<HintSequence> {
  const userPrompt = `
The user encountered this error: "${errorMessage}"
Current code context:
\`\`\`
${codeContext}
\`\`\`
Generate 3 progressive debugging hints and the solution.
  `;

  const response = await callAI(LIVE_MENTOR_SYSTEM_PROMPT, userPrompt, config);
  return JSON.parse(response);
}

export async function createBreakModeChallenge(
  codeContext: string,
  config?: AIClientConfig
): Promise<BreakModeChallenge> {
  const userPrompt = `
Given this project code:
\`\`\`
${codeContext}
\`\`\`
Create a Break Mode experiment to test the user's prediction skills.
  `;

  const response = await callAI(BREAK_MODE_SYSTEM_PROMPT, userPrompt, config);
  return JSON.parse(response);
}