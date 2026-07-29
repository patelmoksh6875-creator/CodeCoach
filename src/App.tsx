import React, { useState } from 'react';
import { Dashboard } from './pages/Dashboard';

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  status: 'mastered' | 'in-progress' | 'locked';
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
}

export const initialKnowledgeGraph: KnowledgeGraph = {
  nodes: [
    { id: '1', label: 'HTML & JSX Basics', status: 'mastered' },
    { id: '2', label: 'React State & Props', status: 'in-progress' },
    { id: '3', label: 'API & Async Logic', status: 'locked' },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'knowledge'>('dashboard');
  const [knowledgeGraph, setKnowledgeGraph] = useState<KnowledgeGraph>(initialKnowledgeGraph);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-3.5 h-3.5 bg-indigo-500 rounded-full animate-pulse"></div>
          <span className="font-bold text-lg text-white tracking-tight">CodeCoach</span>
        </div>

        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🚀 Dashboard & Generator
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'knowledge'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🧠 Knowledge Graph
          </button>
        </div>
      </nav>

      {/* View Switching */}
      <div className="flex-1">
        {activeTab === 'dashboard' ? (
          <Dashboard />
        ) : (
          <main className="p-8 max-w-5xl mx-auto">
            <header className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">Learning Progress</h1>
              <p className="text-xs text-slate-400">
                Track concepts you've mastered and unlock new challenges as you build projects.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {knowledgeGraph.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    node.status === 'mastered'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                      : node.status === 'in-progress'
                      ? 'bg-indigo-950/20 border-indigo-500/30 text-indigo-300'
                      : 'bg-slate-900/50 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] uppercase font-mono tracking-wider mb-2 font-bold opacity-80">
                    {node.status}
                  </div>
                  <div className="font-semibold text-sm text-slate-100">{node.label}</div>
                </div>
              ))}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}