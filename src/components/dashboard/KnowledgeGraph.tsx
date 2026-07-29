import React from 'react';
import { KnowledgeGraphData, MasteryLevel } from '../../types/knowledge';

interface KnowledgeGraphProps {
  data: KnowledgeGraphData;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ data }) => {
  const getBadge = (status: MasteryLevel) => {
    switch (status) {
      case 'mastered':
        return <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">✅ Mastered</span>;
      case 'learning':
        return <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">🟨 In Progress</span>;
      case 'unexplored':
      default:
        return <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded">⬜ Unexplored</span>;
    }
  };

  const nodes = Object.values(data.nodes);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl w-full mx-auto space-y-4">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100">Knowledge Graph</h3>
          <p className="text-xs text-slate-400">Tracking conceptual mastery, not hours logged.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400">
                  {node.category}
                </span>
                <h4 className="text-sm font-semibold text-slate-200">{node.name}</h4>
              </div>
              {getBadge(node.status)}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{node.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};