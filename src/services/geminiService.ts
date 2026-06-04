// ============================================================
// DevQuest — Gemini Service
// ============================================================
// All Gemini API calls go through this module.
// Handles: strict JSON prompting, sanitization, auto-retry,
// and typed error classification for GeminiErrorCard.
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { CheatSheetSession, CodingLab } from '@/types';

// ── Typed errors ──────────────────────────────────────────────

export class GeminiMissingKeyError extends Error {
  constructor() {
    super('MISSING_KEY');
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

// ── Helpers ───────────────────────────────────────────────────

function sanitize(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function getModel(apiKey: string, model: string) {
  if (!apiKey?.trim()) throw new GeminiMissingKeyError();
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model });
}

async function callGemini(apiKey: string, model: string, prompt: string): Promise<string> {
  try {
    const result = await getModel(apiKey, model).generateContent(prompt);
    return result.response.text();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('400')) {
      throw new GeminiMissingKeyError();
    }
    throw new GeminiNetworkError(msg);
  }
}

async function request<T>(apiKey: string, model: string, prompt: string): Promise<T> {
  let raw = await callGemini(apiKey, model, prompt);
  try {
    return JSON.parse(sanitize(raw)) as T;
  } catch {
    // Retry once
    raw = await callGemini(apiKey, model, prompt);
    try {
      return JSON.parse(sanitize(raw)) as T;
    } catch {
      throw new GeminiParseError();
    }
  }
}

// ── Prompts ───────────────────────────────────────────────────

const lessonPrompt = (topic: string) => `You are DevQuest AI, an expert computer science tutor for working developers.

Generate a concise, practical lesson about: ${topic}

Respond with ONLY valid JSON — no markdown fences, no prose outside the JSON object.

Required schema:
{
  "title": "lesson title (max 60 chars)",
  "cheatSheet": "full markdown lesson (400-700 words). Use ## headings, bullet points, bold key terms, and fenced code blocks with language tags. End with a '## Quick Reference' bullet list of 3-5 key takeaways.",
  "quizzes": [
    {
      "question": "clear, specific question testing understanding",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "why this answer is correct (1-2 sentences, mention why others are wrong)"
    }
  ]
}

Rules:
- quizzes: exactly 5 items
- options: exactly 4 strings each
- correctIndex: integer 0-3
- Escape all special characters in JSON strings (\\n for newlines, \\" for quotes)
- No trailing commas`;

const labPrompt = (topic: string) => `You are DevQuest AI. Generate a hands-on coding lab for: ${topic}

Respond with ONLY valid JSON — no markdown fences, no prose outside the JSON object.

Required schema:
{
  "instructions": "markdown lab guide (200-400 words). Include: Objective, What You'll Build, Requirements (numbered list), Hints section, and Expected Output example.",
  "boilerplateCode": "starter code with clear // TODO comments marking exactly what to implement. Use the most appropriate language for this topic.",
  "testCode": "self-contained test cases the student runs to verify their solution. Include at least 3 test cases.",
  "fileName": "suggested filename e.g. solution.js or solution.py"
}

Rules:
- Lab completable in 15-30 minutes
- boilerplateCode must compile/run as-is (even if incomplete)
- testCode must be runnable independently after student fills in the solution
- Escape all special characters: \\n for newlines, \\" for quotes, \\\\ for backslashes`;

const practicePrompt = (question: string) => `You are DevQuest AI. Generate a focused practice session about: ${question}

Respond with ONLY valid JSON — no markdown fences, no prose outside the JSON object.

Required schema:
{
  "title": "session title (max 50 chars)",
  "cheatSheet": "concise markdown summary (200-350 words) covering the key concepts with examples",
  "quizzes": [
    {
      "question": "question testing understanding",
      "options": ["option A", "option B", "option C", "option D"],
      "correctIndex": 0,
      "explanation": "why this is correct (1-2 sentences)"
    }
  ]
}

Rules:
- quizzes: exactly 3 items
- options: exactly 4 strings each
- correctIndex: integer 0-3
- Escape all special characters`;

// ── Public API ────────────────────────────────────────────────

export function generateLesson(
  topic: string,
  apiKey: string,
  model: string,
): Promise<CheatSheetSession> {
  return request<CheatSheetSession>(apiKey, model, lessonPrompt(topic));
}

export function generateCodingLab(
  topic: string,
  apiKey: string,
  model: string,
): Promise<CodingLab> {
  return request<CodingLab>(apiKey, model, labPrompt(topic));
}

export function generatePracticeSession(
  question: string,
  apiKey: string,
  model: string,
): Promise<CheatSheetSession> {
  return request<CheatSheetSession>(apiKey, model, practicePrompt(question));
}
