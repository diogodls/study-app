import { supabase } from '@/services/supabaseClient';
import type {
  CheatSheetSession,
  CodingLab,
  Flashcard,
  NodeDepthMode,
  ContentLanguage,
} from '@/types';

export class GeminiMissingKeyError extends Error {
  constructor() {
    super('USER_GEMINI_KEY_MISSING');
    this.name = 'GeminiMissingKeyError';
  }
}

export class GeminiNetworkError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'GeminiNetworkError';
  }
}

export class GeminiParseError extends Error {
  constructor() {
    super('PARSE_ERROR');
    this.name = 'GeminiParseError';
  }
}

export class GeminiRateLimitError extends Error {
  constructor(retryAfterSeconds: number) {
    super(`CLIENT_RATE_LIMIT:${retryAfterSeconds}`);
    this.name = 'GeminiRateLimitError';
  }
}

export type TeachBackEvaluation = {
  score: number;
  summary: string;
  missingConcepts: string[];
};

function sanitize(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

const COOLDOWN_MS = 1500;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 8;
let lastRequestAt = 0;
let requestQueue: Promise<void> = Promise.resolve();
let requestTimestamps: number[] = [];
const inFlightRequests = new Map<string, Promise<string>>();

type ProxyType = 'lesson' | 'lab' | 'practice' | 'master' | 'flashcards' | 'daily-challenge' | 'evaluate-teachback';

type ProxyBody = {
  type: ProxyType;
  topic?: string;
  model: string;
  depth?: NodeDepthMode;
  language?: ContentLanguage;
  explanation?: string;
};

async function callGeminiProxy(body: ProxyBody): Promise<string> {
  const requestKey = JSON.stringify(body);
  const existing = inFlightRequests.get(requestKey);
  if (existing) return existing;

  const task = requestQueue
    .catch(() => undefined)
    .then(async () => {
      const now = Date.now();
      requestTimestamps = requestTimestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
      if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
        const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - requestTimestamps[0]);
        throw new GeminiRateLimitError(Math.max(1, Math.ceil(retryAfterMs / 1000)));
      }

      const cooldownRemaining = lastRequestAt + COOLDOWN_MS - now;
      if (cooldownRemaining > 0) {
        await new Promise((resolve) => setTimeout(resolve, cooldownRemaining));
      }

      const requestStartedAt = Date.now();
      lastRequestAt = requestStartedAt;
      requestTimestamps.push(requestStartedAt);

      const { data, error } = await supabase.functions
        .invoke<{ text?: string; error?: string }>('gemini-proxy', { body });

      if (error) {
        const message = error.message || 'Gemini proxy request failed';
        if (message.includes('USER_GEMINI_KEY_MISSING')) throw new GeminiMissingKeyError();
        throw new GeminiNetworkError(message);
      }
      if (!data?.text) {
        if (data?.error === 'USER_GEMINI_KEY_MISSING') throw new GeminiMissingKeyError();
        throw new GeminiNetworkError(data?.error ?? 'Gemini proxy returned no text');
      }
      return data.text;
    });

  requestQueue = task.then(() => undefined, () => undefined);
  inFlightRequests.set(requestKey, task);
  const cleanup = () => {
    if (inFlightRequests.get(requestKey) === task) {
      inFlightRequests.delete(requestKey);
    }
  };
  void task.then(cleanup, cleanup);
  return task;
}

async function request<T>(body: ProxyBody): Promise<T> {
  let raw = await callGeminiProxy(body);
  try {
    return JSON.parse(sanitize(raw)) as T;
  } catch {
    raw = await callGeminiProxy(body);
    try {
      return JSON.parse(sanitize(raw)) as T;
    } catch {
      throw new GeminiParseError();
    }
  }
}

export function generateLesson(topic: string, _apiKey: string, model: string, depth: NodeDepthMode, language: ContentLanguage): Promise<CheatSheetSession> {
  return request<CheatSheetSession>({ type: 'lesson', topic, model, depth, language });
}

export function generateCodingLab(topic: string, _apiKey: string, model: string, language: ContentLanguage): Promise<CodingLab> {
  return request<CodingLab>({ type: 'lab', topic, model, language });
}

export function generatePracticeSession(question: string, _apiKey: string, model: string, language: ContentLanguage): Promise<CheatSheetSession> {
  return request<CheatSheetSession>({ type: 'practice', topic: question, model, language });
}

export function generateDailyChallenge(topic: string, model: string, language: ContentLanguage): Promise<CheatSheetSession> {
  return request<CheatSheetSession>({ type: 'daily-challenge', topic, model, language });
}

export function generateMasterSession(topic: string, _apiKey: string, model: string, language: ContentLanguage): Promise<CheatSheetSession> {
  return request<CheatSheetSession>({ type: 'master', topic, model, depth: 'master', language });
}

export function evaluateTeachBack(topic: string, explanation: string, model: string, language: ContentLanguage): Promise<TeachBackEvaluation> {
  return request<TeachBackEvaluation>({
    type: 'evaluate-teachback',
    topic,
    explanation,
    model,
    depth: 'master',
    language,
  });
}

export function generateFlashcards(topic: string, model: string, language: ContentLanguage): Promise<Flashcard[]> {
  return request<Flashcard[]>({ type: 'flashcards', topic, model, language });
}
