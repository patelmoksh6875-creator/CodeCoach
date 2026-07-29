import { useState, useCallback, useEffect } from 'react';
import { KnowledgeGraphData, SessionActivity, SessionSummaryData, MasteryLevel } from '../types/knowledge';
import { INITIAL_KNOWLEDGE_GRAPH, generateSessionSummary } from '../lib/engine/knowledge';

const STORAGE_KEY = 'codecoach_knowledge_graph';

export function useKnowledgeGraph() {
  const [graph, setGraph] = useState<KnowledgeGraphData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_KNOWLEDGE_GRAPH;
      }
    }
    return INITIAL_KNOWLEDGE_GRAPH;
  });

  const [activities, setActivities] = useState<SessionActivity[]>([]);
  const [sessionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(graph));
  }, [graph]);

  const updateConceptStatus = useCallback((conceptId: string, status: MasteryLevel) => {
    setGraph((prev) => {
      if (!prev.nodes[conceptId]) return prev;
      return {
        ...prev,
        nodes: {
          ...prev.nodes,
          [conceptId]: {
            ...prev.nodes[conceptId],
            status,
          },
        },
      };
    });
  }, []);

  const logActivity = useCallback((activity: Omit<SessionActivity, 'timestamp'>) => {
    setActivities((prev) => [...prev, { ...activity, timestamp: Date.now() }]);
  }, []);

  const endSessionAndSummarize = useCallback(async (currentCode: string): Promise<SessionSummaryData> => {
    const summary = await generateSessionSummary(activities, currentCode);

    // Auto-update concept statuses based on session learning
    summary.learnedConcepts.forEach((conceptName) => {
      const match = Object.values(graph.nodes).find(
        (node) => node.name.toLowerCase() === conceptName.toLowerCase()
      );
      if (match) {
        updateConceptStatus(match.id, 'mastered');
      }
    });

    return summary;
  }, [activities, graph, updateConceptStatus]);

  return {
    graph,
    activities,
    sessionDurationMinutes: Math.round((Date.now() - sessionStartTime) / 60000),
    updateConceptStatus,
    logActivity,
    endSessionAndSummarize,
  };
}