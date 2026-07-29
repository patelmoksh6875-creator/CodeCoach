import { useState, useCallback } from 'react';
import { CoachIntervention, HintSequence, BreakModeChallenge, ExplainRequest } from '../types/coach';
import { explainCode, generateDebugHints, createBreakModeChallenge } from '../lib/engine/mentor';
import { SandboxConsoleMessage } from '../types/project';

export function useLiveCoach() {
  const [interventions, setInterventions] = useState<CoachIntervention[]>([]);
  const [activeHintStep, setActiveHintStep] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const clearInterventions = useCallback(() => {
    setInterventions([]);
    setActiveHintStep(0);
  }, []);

  const handleConsoleError = useCallback(async (
    consoleMsg: SandboxConsoleMessage,
    currentCode: string
  ) => {
    if (consoleMsg.type !== 'error' || isAnalyzing) return;

    setIsAnalyzing(true);
    try {
      const hints: HintSequence = await generateDebugHints(consoleMsg.message, currentCode);
      const newIntervention: CoachIntervention = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: 'error_hint',
        title: 'Bug Detected!',
        message: `An error occurred: "${consoleMsg.message}". Let's solve it step by step.`,
        hints,
      };

      setInterventions((prev) => [newIntervention, ...prev]);
      setActiveHintStep(1); // Start at Hint 1
    } catch (err) {
      console.error('Failed to generate mentor debug hints:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing]);

  const requestExplanation = useCallback(async (req: ExplainRequest) => {
    setIsAnalyzing(true);
    try {
      const explanation = await explainCode(req);
      const newIntervention: CoachIntervention = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: 'explanation',
        title: `Understanding Code: ${req.context}`,
        message: explanation.purpose,
      };

      setInterventions((prev) => [newIntervention, ...prev]);
      return explanation;
    } catch (err) {
      console.error('Failed to explain code:', err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const triggerBreakMode = useCallback(async (currentCode: string) => {
    setIsAnalyzing(true);
    try {
      const challenge: BreakModeChallenge = await createBreakModeChallenge(currentCode);
      const newIntervention: CoachIntervention = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        type: 'break_mode',
        title: ' Break Mode Challenge',
        message: challenge.promptToUser,
        breakChallenge: challenge,
      };

      setInterventions((prev) => [newIntervention, ...prev]);
    } catch (err) {
      console.error('Failed to start break mode:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    interventions,
    activeHintStep,
    isAnalyzing,
    setActiveHintStep,
    handleConsoleError,
    requestExplanation,
    triggerBreakMode,
    clearInterventions,
  };
}