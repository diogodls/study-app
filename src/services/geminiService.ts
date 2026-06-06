import { supabase } from '@/services/supabaseClient';
import type { CheatSheetSession, CodingLab } from '@/types';

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

function sanitize(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

async function callGeminiProxy(type: 'lesson' | 'lab' | 'practice', topic: string, model: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke<{ text?: string; error?: string }>('gemini-proxy', {
    body: { type, topic, model },
  });

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
}

async function request<T>(type: 'lesson' | 'lab' | 'practice', topic: string, model: string): Promise<T> {
  let raw = await callGeminiProxy(type, topic, model);
  try {
    return JSON.parse(sanitize(raw)) as T;
  } catch {
    raw = await callGeminiProxy(type, topic, model);
    try {
      return JSON.parse(sanitize(raw)) as T;
    } catch {
      throw new GeminiParseError();
    }
  }
}

export function generateLesson(
  topic: string,
  _apiKey: string,
  model: string,
): Promise<CheatSheetSession> {
  return request<CheatSheetSession>('lesson', topic, model);
}

export function generateCodingLab(
  topic: string,
  _apiKey: string,
  model: string,
): Promise<CodingLab> {
  return request<CodingLab>('lab', topic, model);
}

export function generatePracticeSession(
  question: string,
  _apiKey: string,
  model: string,
): Promise<CheatSheetSession> {
  return request<CheatSheetSession>('practice', question, model);
}
