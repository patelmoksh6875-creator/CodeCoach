import type { AIService } from './AIService';
import { SESSION_SUMMARY_SYSTEM_PROMPT } from '../prompts/prompts';
import type { SessionActivity, SessionSummaryData, GalleryItem } from '../types/knowledge';
import type { ExplanationResult } from '../types/coach';

const GALLERY_KEY = 'codecoach_gallery';

/**
 * Owns the in-session activity log (kept in memory for the current session) and the
 * persisted Gallery of explained snippets (localStorage), plus AI-generated session
 * summaries built from that log.
 */
export class LearningLog {
  private activities: SessionActivity[] = [];

  constructor(private ai: AIService) {}

  record(activity: SessionActivity): void {
    this.activities.push(activity);
  }

  getActivities(): SessionActivity[] {
    return [...this.activities];
  }

  clearSession(): void {
    this.activities = [];
  }

  addGalleryItem(item: Omit<GalleryItem, 'id' | 'timestamp'>): GalleryItem {
    const full: GalleryItem = { ...item, id: crypto.randomUUID(), timestamp: Date.now() };
    const items = this.loadGallery();
    items.unshift(full);
    localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
    return full;
  }

  loadGallery(): GalleryItem[] {
    try {
      const raw = localStorage.getItem(GALLERY_KEY);
      return raw ? (JSON.parse(raw) as GalleryItem[]) : [];
    } catch {
      return [];
    }
  }

  async recordExplanation(
    projectTitle: string,
    fileName: string,
    codeSnippet: string,
    explanation: ExplanationResult
  ): Promise<void> {
    this.record({ timestamp: Date.now(), type: 'explain_viewed', details: `Explained a snippet in ${fileName}` });
    this.addGalleryItem({ projectTitle, fileName, codeSnippet, explanation });
  }

  async generateSessionSummary(): Promise<SessionSummaryData> {
    const log = this.activities
      .map((a) => `- [${a.type}] ${a.details}`)
      .join('\n');
    return this.ai.completeJSON<SessionSummaryData>(
      SESSION_SUMMARY_SYSTEM_PROMPT,
      log.length > 0 ? log : '- No recorded activity this session yet.'
    );
  }
}
