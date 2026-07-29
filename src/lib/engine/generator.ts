import { callAI, AIClientConfig } from '../ai/client';
import { PROJECT_GENERATOR_SYSTEM_PROMPT } from '../ai/prompts';
import { GeneratedProject } from '../../types/project';

export async function generateProject(
  prompt: string,
  config?: AIClientConfig
): Promise<GeneratedProject> {
  const rawResponse = await callAI(
    PROJECT_GENERATOR_SYSTEM_PROMPT,
    `Create an interactive starter project for: "${prompt}"`,
    config
  );

  try {
    const parsed: GeneratedProject = JSON.parse(rawResponse);

    if (!parsed.files || !parsed.files['index.html']) {
      throw new Error('Generated project is missing required entry point files.');
    }

    return parsed;
  } catch (error) {
    throw new Error(
      `Failed to parse generated project structure: ${(error as Error).message}`
    );
  }
}