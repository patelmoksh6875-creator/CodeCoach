import React, { useState, useEffect } from 'react';
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { ProjectLauncher } from '../components/dashboard/ProjectLauncher';
import { callAI } from '../lib/ai/client';
import {
  PROJECT_GENERATOR_SYSTEM_PROMPT,
  EXPLAIN_ANYTHING_SYSTEM_PROMPT,
  LIVE_MENTOR_SYSTEM_PROMPT,
} from '../lib/ai/prompts';

interface Project {
  title: string;
  description: string;
  files: Record<string, string>;
}

// Custom Live AI Observer Component inside Sandpack Context
const LiveAIMonitor: React.FC<{ apiKey: string }> = ({ apiKey }) => {
  const { sandpack } = useSandpack();
  const [selectedText, setSelectedText] = useState<string>('');
  const [lineExplanation, setLineExplanation] = useState<string | null>(null);
  const [isExplainingLine, setIsExplainingLine] = useState<boolean>(false);
  const [activeError, setActiveError] = useState<string | null>(null);
  const [aiFixAdvice, setAiFixAdvice] = useState<string | null>(null);
  const [isAnalyzingError, setIsAnalyzingError] = useState<boolean>(false);

  // Read current active file code safely
  const activeFileKey = sandpack.activeFile || '/App.tsx';
  const activeCode = sandpack.files[activeFileKey]?.code || '';

  // Handle explanation of selected/highlighted text
  const handleExplainSelection = async () => {
    const selectionObj = window.getSelection();
    const selection = selectionObj ? selectionObj.toString().trim() : '';

    if (!selection) {
      setLineExplanation('Please highlight a line or block of code in the editor first!');
      return;
    }

    setSelectedText(selection);
    setIsExplainingLine(true);
    setLineExplanation(null);

    try {
      const response = await callAI(
        EXPLAIN_ANYTHING_SYSTEM_PROMPT,
        `Explain what this specific line/block of code does in simple terms:\n\n\`\`\`tsx\n${selection}\n\`\`\``,
        { apiKey: apiKey || undefined }
      );
      const cleaned = response.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      let summaryText = response;
      try {
        const parsed = JSON.parse(cleaned);
        summaryText = parsed.summary || parsed.keyPoints?.join(' ') || response;
      } catch {
        // Fallback to raw response if non-JSON
      }
      setLineExplanation(summaryText);
    } catch {
      setLineExplanation('Unable to explain selected code. Check your API key.');
    } finally {
      setIsExplainingLine(false);
    }
  };

  // Monitor Sandpack errors in real-time
  const currentError = sandpack.error?.message || null;

  useEffect(() => {
    if (currentError && currentError !== activeError) {
      setActiveError(currentError);
      setIsAnalyzingError(true);

      callAI(
        LIVE_MENTOR_SYSTEM_PROMPT,
        `The user encountered this compiler/runtime error in their React code:\n\nError: ${currentError}\n\nHere is their current code:\n\`\`\`tsx\n${activeCode}\n\`\`\`\n\nExplain why this error happened and give exact steps or modified code to fix it.`,
        { apiKey: apiKey || undefined }
      )
        .then((res) => {
          const cleaned = res.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
          try {
            const parsed = JSON.parse(cleaned);
            setAiFixAdvice(parsed.feedback || res);
          } catch {
            setAiFixAdvice(res);
          }
        })
        .catch(() => {
          setAiFixAdvice(
            'An error occurred in your code. Check for syntax issues, unclosed tags, or missing variables.'
          );
        })
        .finally(() => {
          setIsAnalyzingError(false);
        });
    } else if (!currentError) {
      setActiveError(null);
      setAiFixAdvice(null);
    }
  }, [currentError, activeCode, apiKey, activeError]);

  return (
    <div className="flex flex-col space-y-4">
      {/* Code Inspector Panel */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-indigo-400">💡 Line & Code Inspector</span>
          <button
            onClick={handleExplainSelection}
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer"
          >
            Explain Highlighted Code
          </button>
        </div>
        <p className="text-[11px] text-slate-400 mb-2">
          Highlight any line or snippet in the editor on the left and click <strong>"Explain Highlighted Code"</strong> to learn what it does.
        </p>

        {isExplainingLine && (
          <div className="text-xs text-indigo-300 animate-pulse">Analyzing code snippet...</div>
        )}

        {lineExplanation && (
          <div className="bg-slate-950 p-3 rounded-lg border border-indigo-500/30 text-xs text-slate-200 mt-2">
            {selectedText && (
              <div className="font-semibold text-indigo-300 mb-1">
                Snippet: <code className="text-white bg-slate-900 px-1 py-0.5 rounded">{selectedText}</code>
              </div>
            )}
            <div>{lineExplanation}</div>
          </div>
        )}
      </div>

      {/* Live Error Monitor & AI Fix Guidance */}
      {activeError && (
        <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-xl text-xs space-y-2">
          <div className="flex items-center space-x-2 text-red-400 font-bold">
            <span>🚨 Live Error Detected</span>
          </div>
          <div className="font-mono bg-black/50 p-2 rounded text-red-300 text-[11px] overflow-x-auto">
            {activeError}
          </div>

          <div className="mt-3 pt-3 border-t border-red-500/20">
            <div className="font-bold text-indigo-300 mb-1">🤖 AI Assistant Fix Guidance:</div>
            {isAnalyzingError ? (
              <div className="text-slate-400 animate-pulse">Analyzing error and generating solution...</div>
            ) : (
              <div className="text-slate-200 whitespace-pre-wrap">{aiFixAdvice}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('groq_api_key') || '';
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.value;
    setApiKey(key);
    localStorage.setItem('groq_api_key', key);
  };

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const rawResponse = await callAI(PROJECT_GENERATOR_SYSTEM_PROMPT, prompt, {
        apiKey: apiKey || undefined,
      });

      const cleanedResponse = rawResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```\s*$/, '')
        .trim();

      let parsed: any;
      try {
        parsed = JSON.parse(cleanedResponse);
      } catch {
        throw new Error('Failed to parse AI response as valid JSON.');
      }

      const rawFiles: Record<string, string> = parsed.files || {};
      const sandpackFiles: Record<string, string> = {};

      let mainAppCode = '';
      for (const [filePath, content] of Object.entries(rawFiles)) {
        if (filePath.includes('App') || filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
          mainAppCode = content as string;
        } else {
          const key = filePath.startsWith('/') ? filePath : `/${filePath}`;
          sandpackFiles[key] = content as string;
        }
      }

      if (!mainAppCode) {
        mainAppCode = `import React from 'react';\n\nexport default function App() {\n  return (\n    <div style={{ padding: '20px', fontFamily: 'sans-serif', color: '#fff' }}>\n      <h1>${parsed.title || 'CodeCoach Application'}</h1>\n      <p>${parsed.description || 'App generated successfully!'}</p>\n    </div>\n  );\n}`;
      }

      // Force /App.tsx as entry point for react-ts template
      sandpackFiles['/App.tsx'] = mainAppCode;

      const finalProject: Project = {
        title: parsed.title || 'CodeCoach Starter App',
        description: parsed.description || 'Interactive learning sandbox',
        files: sandpackFiles,
      };

      setActiveProject(finalProject);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error generating project.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse"></div>
          <h1 className="font-bold text-lg text-white">CodeCoach Interactive Studio</h1>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Groq API Key (BYOK)"
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 p-6 flex flex-col items-center">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs max-w-2xl w-full">
            <span className="font-semibold">Error: </span> {error}
          </div>
        )}

        {!activeProject ? (
          <ProjectLauncher onGenerate={handleGenerate} isLoading={isLoading} />
        ) : (
          <div className="w-full max-w-7xl space-y-4">
            {/* Action Bar */}
            <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">{activeProject.title}</h2>
                <p className="text-xs text-slate-400">{activeProject.description}</p>
              </div>

              <button
                onClick={() => setActiveProject(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-2 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              >
                ← New Project
              </button>
            </div>

            {/* Sandpack Interactive Environment */}
            <SandpackProvider
              template="react-ts"
              theme="dark"
              files={activeProject.files}
              options={{
                recompileMode: 'immediate',
                recompileDelay: 300,
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Editor Container */}
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 flex flex-col h-[650px]">
                  <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-xs font-bold text-slate-400 flex justify-between items-center">
                    <span>⚡ Live Code Editor</span>
                    <span className="text-[10px] text-indigo-400">Edit code directly or highlight to explain</span>
                  </div>
                  <div className="flex-1 overflow-auto">
                    <SandpackCodeEditor
                      showLineNumbers
                      showInlineErrors
                      showTabs
                      closableTabs
                      style={{ height: '100%' }}
                    />
                  </div>
                </div>

                {/* Live Preview & AI Observer */}
                <div className="flex flex-col space-y-4 h-[650px] overflow-y-auto">
                  <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900 h-[360px] flex flex-col">
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 text-xs font-bold text-slate-400">
                      📱 Live Output Preview
                    </div>
                    <div className="flex-1">
                      <SandpackPreview style={{ height: '100%' }} showNavigator />
                    </div>
                  </div>

                  <LiveAIMonitor apiKey={apiKey} />
                </div>
              </div>
            </SandpackProvider>
          </div>
        )}
      </main>
    </div>
  );
};