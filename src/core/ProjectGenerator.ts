import type { AIService } from './AIService';
import { PROJECT_GENERATOR_SYSTEM_PROMPT } from '../prompts/prompts';
import type { GeneratedProject } from '../types/project';

/** Turns a plain-language idea into a runnable GeneratedProject via the AI service. */
export class ProjectGenerator {
  constructor(private ai: AIService) {}

  async generate(ideaPrompt: string): Promise<GeneratedProject> {
    const result = await this.ai.completeJSON<GeneratedProject>(
      PROJECT_GENERATOR_SYSTEM_PROMPT,
      `Build a small app for this idea: "${ideaPrompt}"`
    );
    this.validate(result);
    return result;
  }

  private validate(project: GeneratedProject): void {
    if (!project.files || !project.files[project.entryFile]) {
      throw new Error('AI response did not include the entry file it declared.');
    }
  }
}
