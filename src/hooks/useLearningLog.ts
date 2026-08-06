import { useCallback, useState } from 'react';
import { services } from '../core/services';
import type { GalleryItem, SessionSummaryData } from '../types/knowledge';

/** React-facing wrapper around the LearningLog service for the Gallery tab + session summary. */
export function useLearningLog() {
  const [gallery, setGallery] = useState<GalleryItem[]>(() => services.log.loadGallery());
  const [summary, setSummary] = useState<SessionSummaryData | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const refreshGallery = useCallback(() => {
    setGallery(services.log.loadGallery());
  }, []);

  const endSession = useCallback(async () => {
    setIsSummarizing(true);
    try {
      const result = await services.log.generateSessionSummary();
      setSummary(result);
      services.log.clearSession();
    } finally {
      setIsSummarizing(false);
    }
  }, []);

  return {
    gallery,
    refreshGallery,
    summary,
    dismissSummary: () => setSummary(null),
    isSummarizing,
    endSession,
  };
}
