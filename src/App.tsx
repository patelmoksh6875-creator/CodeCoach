import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';
import { KnowledgeGallery } from './components/dashboard/KnowledgeGallery';
import { SessionSummary } from './components/dashboard/SessionSummary';
import { useLearningLog } from './hooks/useLearningLog';

type Tab = 'build' | 'gallery';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('build');
  const log = useLearningLog();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/90 px-6 py-3 backdrop-blur">
        <div className="text-sm font-semibold tracking-tight text-neutral-100">CodeCoach</div>

        <div className="flex rounded-md border border-neutral-800 bg-neutral-900 p-0.5">
          <TabButton label="Build" active={activeTab === 'build'} onClick={() => setActiveTab('build')} />
          <TabButton
            label="Gallery"
            active={activeTab === 'gallery'}
            onClick={() => {
              setActiveTab('gallery');
              log.refreshGallery();
            }}
          />
        </div>

        <button
          onClick={log.endSession}
          disabled={log.isSummarizing}
          className="rounded border border-neutral-800 px-3 py-1.5 text-xs text-neutral-400 hover:border-neutral-600 hover:text-neutral-200 disabled:opacity-40"
        >
          {log.isSummarizing ? 'Summarizing…' : 'End session'}
        </button>
      </nav>

      {activeTab === 'build' ? <Dashboard /> : <KnowledgeGallery items={log.gallery} />}

      {log.summary && <SessionSummary summary={log.summary} onClose={log.dismissSummary} />}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
        active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-200'
      }`}
    >
      {label}
    </button>
  );
}
