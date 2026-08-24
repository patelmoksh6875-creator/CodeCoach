import Groq from 'groq-sdk';

const STORAGE_KEY = 'codecoach_groq_api_key';
const MODEL = 'openai/gpt-oss-120b';

export class MissingApiKeyError extends Error {
  constructor() {
    super('No Groq API key set.');
    this.name = 'MissingApiKeyError';
  }
}

export class AIRequestError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = 'AIRequestError';
  }
}

/**
 * Thin class wrapper around groq-sdk. Owns the BYOK API key (persisted in localStorage,
 * never sent anywhere but Groq's API directly from the browser) and exposes a single
 * generic JSON-mode chat call every engine class builds on.
 */
export class AIService {
  private client: Groq | null = null;
  private apiKey: string | null = null;

  constructor() {
    this.apiKey = localStorage.getItem(STORAGE_KEY);
    if (this.apiKey) this.client = new Groq({ apiKey: this.apiKey, dangerouslyAllowBrowser: true });
  }

  hasApiKey(): boolean {
    return !!this.apiKey;
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    localStorage.setItem(STORAGE_KEY, key);
    this.client = new Groq({ apiKey: key, dangerouslyAllowBrowser: true });
  }

  clearApiKey(): void {
    this.apiKey = null;
    this.client = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Sends a system + user prompt pair, forces JSON-object output, and parses the result
   * as T. Throws MissingApiKeyError / AIRequestError on failure — callers decide how to
   * surface that (never swallow it silently).
   */
  async completeJSON<T>(systemPrompt: string, userPrompt: string): Promise<T> {
    if (!this.client) throw new MissingApiKeyError();

    let raw: string;
    try {
      const response = await this.client.chat.completions.create({
        model: MODEL,
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });
      raw = response.choices[0]?.message?.content ?? '';
    } catch (err) {
      throw new AIRequestError('The request to Groq failed.', err);
    }

    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      throw new AIRequestError('Groq returned a response that was not valid JSON.', err);
    }
  }
}

/** Single shared instance for the whole app — one API key, one client. */
export const aiService = new AIService();
