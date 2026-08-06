import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackFileExplorer,
  useSandpack,
  useActiveCode,
} from '@codesandbox/sandpack-react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { services } from '../core/services';
import { MissingApiKeyError, AIRequestError } from '../core/AIService';
import { useLiveCoach } from '../hooks/useLiveCoach';
import { ProjectLauncher } from '../components/dashboard/ProjectLauncher';
import { ApiKeyModal } from '../components/common/ApiKeyModal';
import { CoachPanel } from '../components/coach/CoachPanel';
import { ExplainDrawer } from '../components/coach/ExplainDrawer';
import { BreakMode } from '../components/coach/BreakMode';
import { ProgressiveReveal } from '../components/coach/HintSystem';
import type { GeneratedProject } from '../types/project';

const EDIT_DEBOUNCE_MS = 500;
const EXPLAIN_DEBOUNCE_MS = 450;

export function Dashboard() {
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [pendingIdea, setPendingIdea] = useState<string | null>(null);

  const generate = useCallback(async (idea: string) => {
    if (!services.ai.hasApiKey()) {
      setPendingIdea(idea);
      setNeedsApiKey(true);
      return;
    }
    setIsGenerating(true);
    setGenError(null);
    try {
      const result = await services.generator.generate(idea);
      setProject(result);
    } catch (err) {
      if (err instanceof MissingApiKeyError) {
        setPendingIdea(idea);
        setNeedsApiKey(true);
      } else {
        setGenError(err instanceof AIRequestError ? err.message : 'Generation failed unexpectedly.');
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleApiKeySubmit = useCallback(
    (key: string) => {
      services.ai.setApiKey(key);
      setNeedsApiKey(false);
      if (pendingIdea) {
        const idea = pendingIdea;
        setPendingIdea(null);
        void generate(idea);
      }
    },
    [pendingIdea, generate]
  );

  if (!project) {
    return (
      <>
        <ProjectLauncher onGenerate={generate} isGenerating={isGenerating} error={genError} />
        {needsApiKey && (
          <ApiKeyModal onSubmit={handleApiKeySubmit} onCancel={() => setNeedsApiKey(false)} />
        )}
      </>
    );
  }

  return <Workspace project={project} onExit={() => setProject(null)} />;
}

function Workspace({ project, onExit }: { project: GeneratedProject; onExit: () => void }) {
  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-neutral-950">
      <div className="flex items-center gap-3 border-b border-neutral-800 px-4 py-2.5">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-neutral-400 hover:text-neutral-100"
        >
          <ArrowLeft size={14} />
          Back
        </button>
        <div className="text-sm font-medium text-neutral-100">{project.title}</div>
        <div className="text-xs text-neutral-500">{project.description}</div>
      </div>

      <SandpackProvider
        template="react"
        theme="dark"
        files={project.files}
        options={{ activeFile: project.entryFile, autorun: true }}
        style={{ flex: 1, minHeight: 0 }}
      >
        <MentorWorkspace project={project} />
      </SandpackProvider>
    </div>
  );
}

function MentorWorkspace({ project }: { project: GeneratedProject }) {
  const { sandpack } = useSandpack();
  const { code } = useActiveCode();
  const editorRef = useRef<HTMLDivElement>(null);

  const coach = useLiveCoach({
    projectTitle: project.title,
    onNeedsApiKey: () => setShowApiKeyModal(true),
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  // --- Live edit monitor: debounce full-file content changes, diff against last snapshot ---
  const editDebounceRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    coach.primeEditSnapshot(code);
    // only re-prime on file switch, not on every keystroke
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandpack.activeFile]);

  useEffect(() => {
    window.clearTimeout(editDebounceRef.current);
    editDebounceRef.current = window.setTimeout(() => {
      coach.watchEdit(code);
    }, EDIT_DEBOUNCE_MS);
    return () => window.clearTimeout(editDebounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // --- Highlight-to-explain: listen for selectionchange, debounce, verify selection is inside editor ---
  const explainDebounceRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = document.getSelection();
      if (!selection || selection.isCollapsed) return;
      const anchorNode = selection.anchorNode;
      if (!editorRef.current || !anchorNode || !editorRef.current.contains(anchorNode)) return;

      const text = selection.toString();
      if (!text.trim() || text.length < 3) return;

      window.clearTimeout(explainDebounceRef.current);
      explainDebounceRef.current = window.setTimeout(() => {
        coach.requestExplanation(text, sandpack.activeFile);
      }, EXPLAIN_DEBOUNCE_MS);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      window.clearTimeout(explainDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sandpack.activeFile]);

  // --- Compile/runtime error -> offer debug hints ---
  const sandpackError = sandpack.error;

  const requestHintsForCurrentError = () => {
    if (!sandpackError) return;
    coach.requestDebugHints(sandpackError.message, code);
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden" ref={editorRef}>
        {sandpackError && (
          <div className="flex items-center justify-between gap-3 border-b border-red-900/60 bg-red-950/40 px-4 py-2">
            <div className="flex items-center gap-2 text-xs text-red-300">
              <AlertTriangle size={14} />
              <span className="truncate">{sandpackError.message}</span>
            </div>
            <button
              onClick={requestHintsForCurrentError}
              className="shrink-0 rounded bg-red-900/60 px-2 py-1 text-xs text-red-100 hover:bg-red-800/60"
            >
              Get hints
            </button>
          </div>
        )}

        <SandpackLayout style={{ flex: 1, minHeight: 0, border: 'none' }}>
          <SandpackFileExplorer style={{ height: '100%' }} />
          <SandpackCodeEditor style={{ height: '100%' }} showTabs showLineNumbers />
          <SandpackPreview style={{ height: '100%' }} showNavigator showOpenInCodeSandbox={false} />
        </SandpackLayout>
      </div>

      <CoachPanel
        interventions={coach.interventions}
        isBusy={coach.isBusy}
        onTriggerBreakMode={() => coach.triggerBreakMode(code)}
        onRequestGuidedBuild={(feature) => coach.requestGuidedBuild(feature, code)}
      />

      {coach.explanation && (
        <ExplainDrawer
          snippet={coach.explanation.snippet}
          result={coach.explanation.result}
          onClose={coach.dismissExplanation}
        />
      )}

      {coach.debugHints && (
        <ProgressiveReveal
          heading="Debug hints"
          steps={[
            { title: 'Nudge', body: coach.debugHints.hint1 },
            { title: 'Where to look', body: coach.debugHints.hint2 },
            { title: 'Near-solution', body: coach.debugHints.hint3 },
          ]}
          finalLabel="Solution"
          finalContent={coach.debugHints.solutionCode}
          onClose={coach.dismissDebugHints}
        />
      )}

      {coach.guidedPlan && (
        <ProgressiveReveal
          heading={`Guided build: ${coach.guidedPlan.featureSummary}`}
          steps={coach.guidedPlan.steps.map((s) => ({ title: s.title, body: s.guidance, codeHint: s.codeHint }))}
          finalLabel="What the finished feature looks like"
          finalContent={coach.guidedPlan.finalSolutionNote}
          onClose={coach.dismissGuidedPlan}
        />
      )}

      {coach.breakChallenge && (
        <BreakMode challenge={coach.breakChallenge} onResolve={coach.resolveBreakMode} />
      )}

      {showApiKeyModal && (
        <ApiKeyModal
          onSubmit={(key) => {
            services.ai.setApiKey(key);
            setShowApiKeyModal(false);
          }}
          onCancel={() => setShowApiKeyModal(false)}
        />
      )}
    </div>
  );
}
