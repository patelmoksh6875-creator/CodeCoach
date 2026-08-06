import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackFileExplorer,
  useSandpack,
  useActiveCode,
} from '@codesandbox/sandpack-react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { services } from '../core/services';
import { MissingApiKeyError, AIRequestError } from '../core/AIService';
import type { SavedProjectRecord } from '../core/ProjectStore';
import { useLiveCoach } from '../hooks/useLiveCoach';
import { ProjectLauncher } from '../components/dashboard/ProjectLauncher';
import { ProjectSwitcher } from '../components/dashboard/ProjectSwitcher';
import { ApiKeyModal } from '../components/common/ApiKeyModal';
import { CoachPanel } from '../components/coach/CoachPanel';
import { ExplainDrawer } from '../components/coach/ExplainDrawer';
import { BreakMode } from '../components/coach/BreakMode';
import { ProgressiveReveal } from '../components/coach/HintSystem';
import { GuidedBuildPanel } from '../components/coach/GuidedBuildPanel';
import { FloatingPreview } from '../components/preview/FloatingPreview';
import type { FileMap, GeneratedProject } from '../types/project';

const EDIT_DEBOUNCE_MS = 500;
const EXPLAIN_DEBOUNCE_MS = 450;
const HIGHLIGHT_DURATION_MS = 4000;

export function Dashboard() {
  const [project, setProject] = useState<GeneratedProject | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [pendingIdea, setPendingIdea] = useState<string | null>(null);
  const [savedProjects, setSavedProjects] = useState<SavedProjectRecord[]>(() => services.projects.list());

  const refreshSaved = useCallback(() => setSavedProjects(services.projects.list()), []);

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
      services.projects.save(result, 'generated');
      refreshSaved();
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
  }, [refreshSaved]);

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

  const handleImportFolder = useCallback(
    async (fileList: FileList) => {
      try {
        const title = window.prompt('Name this project', 'Imported project') || 'Imported project';
        const imported = await services.projects.importFromFileList(fileList, title);
        services.projects.save(imported, 'imported');
        refreshSaved();
        setProject(imported);
      } catch (err) {
        setGenError(err instanceof Error ? err.message : 'Import failed.');
      }
    },
    [refreshSaved]
  );

  const handleSelectSaved = useCallback((record: SavedProjectRecord) => {
    setProject(record.project);
  }, []);

  const handleDeleteSaved = useCallback(
    (id: string) => {
      services.projects.remove(id);
      refreshSaved();
    },
    [refreshSaved]
  );

  if (!project) {
    return (
      <>
        <div className="flex justify-center px-4 pt-4">
          <ProjectSwitcher
            savedProjects={savedProjects}
            onSelect={handleSelectSaved}
            onImportFolder={handleImportFolder}
            onDelete={handleDeleteSaved}
          />
        </div>
        <ProjectLauncher onGenerate={generate} isGenerating={isGenerating} error={genError} />
        {needsApiKey && (
          <ApiKeyModal onSubmit={handleApiKeySubmit} onCancel={() => setNeedsApiKey(false)} />
        )}
      </>
    );
  }

  return (
    <Workspace
      project={project}
      onExit={() => setProject(null)}
      savedProjects={savedProjects}
      onSelectSaved={handleSelectSaved}
      onImportFolder={handleImportFolder}
      onDeleteSaved={handleDeleteSaved}
    />
  );
}

interface WorkspaceProps {
  project: GeneratedProject;
  onExit: () => void;
  savedProjects: SavedProjectRecord[];
  onSelectSaved: (record: SavedProjectRecord) => void;
  onImportFolder: (fileList: FileList) => void;
  onDeleteSaved: (id: string) => void;
}

function Workspace({ project, onExit, savedProjects, onSelectSaved, onImportFolder, onDeleteSaved }: WorkspaceProps) {
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
        <div className="hidden text-xs text-neutral-500 sm:block">{project.description}</div>
        <div className="ml-auto">
          <ProjectSwitcher
            savedProjects={savedProjects}
            onSelect={onSelectSaved}
            onImportFolder={onImportFolder}
            onDelete={onDeleteSaved}
          />
        </div>
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
  const highlightRef = useRef<{ el: HTMLElement; original: string } | null>(null);
  const highlightTimeoutRef = useRef<number | undefined>(undefined);

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

  // --- Tutor mode: scroll to + highlight a target line inside the live CodeMirror editor ---
  const highlightAnchorInEditor = useCallback((anchor: string) => {
    if (!editorRef.current || !anchor.trim()) return;

    if (highlightRef.current) {
      highlightRef.current.el.style.cssText = highlightRef.current.original;
      highlightRef.current = null;
    }
    window.clearTimeout(highlightTimeoutRef.current);

    const needle = anchor.trim().split('\n')[0].trim();
    if (!needle) return;

    const lines = Array.from(editorRef.current.querySelectorAll('.cm-line')) as HTMLElement[];
    const match = lines.find((line) => {
      const text = line.textContent?.trim() ?? '';
      return text.length > 0 && (text.includes(needle) || needle.includes(text));
    });
    if (!match) return;

    match.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const original = match.style.cssText;
    match.style.cssText += 'background-color: rgba(251,191,36,0.22); outline: 1px solid rgba(251,191,36,0.65); border-radius: 2px;';
    highlightRef.current = { el: match, original };
    highlightTimeoutRef.current = window.setTimeout(() => {
      match.style.cssText = original;
      highlightRef.current = null;
    }, HIGHLIGHT_DURATION_MS);
  }, []);

  // --- Guided build: "push it for me" writes the AI's implementation straight into Sandpack ---
  const applyGuidedBuildNow = useCallback(async () => {
    const currentFiles: FileMap = Object.fromEntries(
      Object.entries(sandpack.files).map(([path, file]) => [path, file.code])
    );
    const result = await coach.applyGuidedBuild(currentFiles);
    if (result) {
      sandpack.updateFile(result.updatedFiles, undefined, true);
    }
  }, [sandpack, coach]);

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
        </SandpackLayout>
      </div>

      <CoachPanel
        interventions={coach.interventions}
        isBusy={coach.isBusy}
        onTriggerBreakMode={() => coach.triggerBreakMode(code)}
        onRequestGuidedBuild={(feature) => coach.requestGuidedBuild(feature, code)}
      />

      <FloatingPreview />

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

      {coach.guidedPlan && coach.guidedMode && (
        <GuidedBuildPanel
          plan={coach.guidedPlan}
          mode={coach.guidedMode}
          isApplying={coach.isApplyingGuided}
          onApply={applyGuidedBuildNow}
          onStartTutor={coach.startGuidedTutor}
          onClose={coach.dismissGuidedPlan}
          onHighlightAnchor={highlightAnchorInEditor}
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
