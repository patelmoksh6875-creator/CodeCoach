import React, { useState } from 'react';
import { useProjectState } from '../hooks/useProjectState';
import { useLiveCoach } from '../hooks/useLiveCoach';
import { FileExplorer } from '../components/editor/FileExplorer';
import { CodeEditor } from '../components/editor/CodeEditor';
import { LivePreview } from '../components/editor/LivePreview';
import { CoachPanel } from '../components/coach/CoachPanel';
import { GeneratedProject } from '../types/project';

interface WorkspaceProps {
  initialProject?: GeneratedProject;
  onExitWorkspace: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ initialProject, onExitWorkspace }) => {
  const { project, files, activeFileName, activeFile, setActiveFileName, updateFileContent } =
    useProjectState(initialProject);

  const {
    interventions,
    activeHintStep,
    isAnalyzing,
    setActiveHintStep,
    handleConsoleError,
    triggerBreakMode,
  } = useLiveCoach();

  if (!project) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <p>No project active.</p>
        <button
          onClick={onExitWorkspace}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Top Navbar */}
      <header className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onExitWorkspace}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← Exit
          </button>
          <span className="text-slate-700">|</span>
          <h1 className="text-sm font-bold text-slate-200">{project.projectName}</h1>
        </div>
        <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded">
          CodeCoach IDE
        </span>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar File Explorer */}
        <FileExplorer
          files={files}
          activeFileName={activeFileName}
          onSelectFile={setActiveFileName}
        />

        {/* Center Pane: Editor + Live Preview Split */}
        <div className="flex-1 flex flex-col md:flex-row border-r border-slate-800 overflow-hidden">
          <div className="flex-1 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-slate-800">
            {activeFile && (
              <CodeEditor
                fileName={activeFile.name}
                code={activeFile.content}
                onChange={(val) => updateFileContent(activeFile.name, val)}
              />
            )}
          </div>
          <div className="flex-1 h-1/2 md:h-full p-2 bg-slate-950">
            <LivePreview
              files={files}
              onConsoleMessage={(msg) => handleConsoleError(msg, activeFile?.content || '')}
            />
          </div>
        </div>

        {/* Right Side AI Coach Panel */}
        <CoachPanel
          interventions={interventions}
          activeHintStep={activeHintStep}
          isAnalyzing={isAnalyzing}
          onHintStepChange={setActiveHintStep}
          onTriggerBreakMode={() => triggerBreakMode(activeFile?.content || '')}
        />
      </div>
    </div>
  );
};