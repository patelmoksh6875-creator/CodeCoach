import { useCallback, useRef, useState } from 'react';
import { services } from '../core/services';
import { MissingApiKeyError, AIRequestError } from '../core/AIService';
import type {
  CoachIntervention,
  ExplanationResult,
  HintSequence,
  BreakModeChallenge,
  GuidedBuildPlan,
  LiveEditFeedback,
} from '../types/coach';

let interventionCounter = 0;
function nextId(): string {
  interventionCounter += 1;
  return `intervention-${Date.now()}-${interventionCounter}`;
}

export interface UseLiveCoachOptions {
  projectTitle: string;
  onNeedsApiKey: () => void;
}

/**
 * The core interaction hook: owns the coach's feed of interventions and every action that
 * can add to it (explain, debug hints, break mode, guided build, live edit feedback).
 * Delegates all AI/logic work to the class services in `core/`; this hook is purely the
 * React-facing state glue.
 */
export function useLiveCoach({ projectTitle, onNeedsApiKey }: UseLiveCoachOptions) {
  const [interventions, setInterventions] = useState<CoachIntervention[]>([]);
  const [explanation, setExplanation] = useState<{ snippet: string; result: ExplanationResult } | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [debugHints, setDebugHints] = useState<HintSequence | null>(null);
  const [breakChallenge, setBreakChallenge] = useState<BreakModeChallenge | null>(null);
  const [guidedPlan, setGuidedPlan] = useState<GuidedBuildPlan | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const lastSnapshot = useRef<string>('');

  const pushIntervention = useCallback((i: Omit<CoachIntervention, 'id' | 'timestamp'>) => {
    setInterventions((prev) => [{ ...i, id: nextId(), timestamp: Date.now() }, ...prev]);
  }, []);

  const handleAIError = useCallback(
    (err: unknown, context: string) => {
      if (err instanceof MissingApiKeyError) {
        onNeedsApiKey();
        return;
      }
      const message = err instanceof AIRequestError ? err.message : `${context} failed unexpectedly.`;
      setLastError(message);
      pushIntervention({ type: 'praise', title: 'Something went wrong', message });
    },
    [onNeedsApiKey, pushIntervention]
  );

  const requestExplanation = useCallback(
    async (snippet: string, fileName: string) => {
      if (!snippet.trim()) return;
      setIsExplaining(true);
      setLastError(null);
      try {
        const result = await services.mentor.explainSnippet(snippet, fileName);
        setExplanation({ snippet, result });
        await services.log.recordExplanation(projectTitle, fileName, snippet, result);
        pushIntervention({ type: 'explanation', title: 'Explained a snippet', message: result.purpose });
      } catch (err) {
        handleAIError(err, 'Explain');
      } finally {
        setIsExplaining(false);
      }
    },
    [projectTitle, pushIntervention, handleAIError]
  );

  const requestDebugHints = useCallback(
    async (errorMessage: string, fileContents: string) => {
      setIsBusy(true);
      setLastError(null);
      try {
        const hints = await services.mentor.generateDebugHints(errorMessage, fileContents);
        setDebugHints(hints);
        services.log.record({ timestamp: Date.now(), type: 'error_fixed', details: `Got hints for: ${errorMessage.slice(0, 80)}` });
        pushIntervention({ type: 'error_hint', title: 'Error hints ready', message: errorMessage.slice(0, 120) });
      } catch (err) {
        handleAIError(err, 'Debug hints');
      } finally {
        setIsBusy(false);
      }
    },
    [pushIntervention, handleAIError]
  );

  const triggerBreakMode = useCallback(
    async (fileContents: string) => {
      setIsBusy(true);
      setLastError(null);
      try {
        const challenge = await services.mentor.createBreakChallenge(fileContents);
        setBreakChallenge(challenge);
        pushIntervention({ type: 'break_mode', title: 'Break Mode', message: challenge.question });
      } catch (err) {
        handleAIError(err, 'Break mode');
      } finally {
        setIsBusy(false);
      }
    },
    [pushIntervention, handleAIError]
  );

  const resolveBreakMode = useCallback(
    (wasCorrect: boolean) => {
      if (wasCorrect) {
        services.log.record({ timestamp: Date.now(), type: 'break_mode_passed', details: 'Correctly predicted a code change outcome' });
      }
      setBreakChallenge(null);
    },
    []
  );

  const requestGuidedBuild = useCallback(
    async (featureRequest: string, fileContents: string) => {
      if (!featureRequest.trim()) return;
      setIsBusy(true);
      setLastError(null);
      try {
        const plan = await services.mentor.createGuidedBuildPlan(featureRequest, fileContents);
        setGuidedPlan(plan);
        services.log.record({ timestamp: Date.now(), type: 'guided_build', details: `Guided build: ${plan.featureSummary}` });
        pushIntervention({ type: 'guided_build', title: 'Guided plan ready', message: plan.featureSummary });
      } catch (err) {
        handleAIError(err, 'Guided build');
      } finally {
        setIsBusy(false);
      }
    },
    [pushIntervention, handleAIError]
  );

  /** Call with the full current file contents on every debounced edit tick. */
  const watchEdit = useCallback(
    (currentContents: string): LiveEditFeedback | null => {
      const previous = lastSnapshot.current;
      lastSnapshot.current = currentContents;
      if (!previous) return null; // first snapshot, nothing to diff against yet
      const feedback = services.liveEdit.analyze(previous, currentContents);
      if (feedback) {
        services.log.record({ timestamp: Date.now(), type: 'code_edit', details: feedback.message });
        pushIntervention({ type: 'live_edit', title: 'Live edit', message: feedback.message });
      }
      return feedback;
    },
    [pushIntervention]
  );

  const primeEditSnapshot = useCallback((contents: string) => {
    lastSnapshot.current = contents;
  }, []);

  return {
    interventions,
    explanation,
    isExplaining,
    debugHints,
    breakChallenge,
    guidedPlan,
    isBusy,
    lastError,
    requestExplanation,
    dismissExplanation: () => setExplanation(null),
    requestDebugHints,
    dismissDebugHints: () => setDebugHints(null),
    triggerBreakMode,
    resolveBreakMode,
    requestGuidedBuild,
    dismissGuidedPlan: () => setGuidedPlan(null),
    watchEdit,
    primeEditSnapshot,
  };
}
