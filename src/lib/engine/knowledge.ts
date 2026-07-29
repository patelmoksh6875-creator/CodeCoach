import { callAI, AIClientConfig } from '../ai/client';
import { SESSION_SUMMARY_SYSTEM_PROMPT } from '../ai/prompts';
import { KnowledgeGraphData, SessionActivity, SessionSummaryData } from '../../types/knowledge';

export const INITIAL_KNOWLEDGE_GRAPH: KnowledgeGraphData = {
  nodes: {
    html_basics: {
      id: 'html_basics',
      name: 'HTML Elements',
      category: 'HTML',
      status: 'mastered',
      description: 'Understanding tags, structure, and attributes',
    },
    css_flexbox: {
      id: 'css_flexbox',
      name: 'CSS Flexbox',
      category: 'CSS',
      status: 'mastered',
      description: 'Aligning and scaling elements in layout',
    },
    js_functions: {
      id: 'js_functions',
      name: 'Functions',
      category: 'JavaScript',
      status: 'mastered',
      description: 'Declaring, calling, and passing parameters',
    },
    dom_events: {
      id: 'dom_events',
      name: 'DOM Events',
      category: 'DOM',
      status: 'learning',
      description: 'Listening to clicks, inputs, and form events',
    },
    js_objects: {
      id: 'js_objects',
      name: 'Objects & Arrays',
      category: 'JavaScript',
      status: 'learning',
      description: 'Storing and updating key-value data structures',
    },
    async_await: {
      id: 'async_await',
      name: 'Async/Await',
      category: 'Async',
      status: 'unexplored',
      description: 'Handling promises and asynchronous API calls',
    },
    closures: {
      id: 'closures',
      name: 'Closures',
      category: 'JavaScript',
      status: 'unexplored',
      description: 'Lexical scope and retained variable state',
    },
  },
};

export async function generateSessionSummary(
  activities: SessionActivity[],
  currentCode: string,
  config?: AIClientConfig
): Promise<SessionSummaryData> {
  const userPrompt = `
Session activity log:
${JSON.stringify(activities, null, 2)}

Final Project Code State:
\`\`\`
${currentCode}
\`\`\`

Generate a session learning summary based on these activities.
  `;

  const response = await callAI(SESSION_SUMMARY_SYSTEM_PROMPT, userPrompt, config);
  return JSON.parse(response);
}