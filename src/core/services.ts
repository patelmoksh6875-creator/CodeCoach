import { aiService } from './AIService';
import { ProjectGenerator } from './ProjectGenerator';
import { MentorEngine } from './MentorEngine';
import { LiveEditAnalyzer } from './LiveEditAnalyzer';
import { LearningLog } from './LearningLog';
import { ProjectStore } from './ProjectStore';

/** One shared instance of each service for the whole app's lifetime. */
export const services = {
  ai: aiService,
  generator: new ProjectGenerator(aiService),
  mentor: new MentorEngine(aiService),
  liveEdit: new LiveEditAnalyzer(),
  log: new LearningLog(aiService),
  projects: new ProjectStore(),
};
