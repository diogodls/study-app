import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type RequestType = 'lesson' | 'lab' | 'practice' | 'master' | 'flashcards' | 'daily-challenge' | 'assessment' | 'evaluate-teachback';
type Depth = 'learn' | 'deepen' | 'master';
type Language = 'en' | 'pt-BR';

type ProxyBody = {
  action?: 'generate' | 'save-key' | 'key-status' | 'delete-key';
  apiKey?: string;
  topic?: string;
  explanation?: string;
  model?: string;
  type?: RequestType;
  depth?: Depth;
  language?: Language;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function languageInstruction(language: Language) {
  return language === 'pt-BR'
    ? 'Respond entirely in Brazilian Portuguese.'
    : 'Respond entirely in English.';
}

function lessonPrompt(topic: string, depth: Depth, language: Language) {
  const languageLine = languageInstruction(language);
  if (depth === 'learn') {
    return `You are DevQuest AI, a rigorous CS tutor for working developers. ${languageLine}
Generate a dense beginner-friendly lesson about: ${topic}
Respond with ONLY valid JSON.
Schema:
{
  "title": "max 60 chars",
  "cheatSheet": "rich markdown lesson (900-1400 words) with sections: ## Concept, ## How It Works, ## Code Examples, ## Common Mistakes, ## Quick Reference",
  "quizzes": [{ "question": "...", "codeSnippet": "optional", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "...", "hint": "short conceptual hint without revealing the answer" }]
}
Rules:
- exactly 5 quizzes
- at least 2 quizzes with codeSnippet
- no trivial recall questions
- quizzes should be approachable but still practical
- explanations must explain why correct and why wrong options are wrong
- every quiz must include a useful hint that does not reveal or eliminate the answer`;
  }

  return `You are DevQuest AI, an expert computer science tutor for working developers. ${languageLine}
Generate a comprehensive, in-depth lesson about: ${topic}
Respond with ONLY valid JSON.
Schema:
{
  "title": "max 60 chars",
  "cheatSheet": "comprehensive markdown lesson (1200-2000 words) with sections: ## Concept, ## How It Works, ## Code Examples, ## Common Mistakes, ## When To Use / When Not To Use, ## Quick Reference",
  "quizzes": [{ "question": "...", "codeSnippet": "optional", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "...", "hint": "short conceptual hint without revealing the answer" }]
}
Rules:
- exactly 5 quizzes
- at least 3 quizzes with codeSnippet
- vary question types: analysis, comparison, debugging, application, tradeoff
- never ask simple definition recall
- explanations must explain why correct and why wrong options are wrong
- every quiz must include a useful hint that does not reveal or eliminate the answer`;
}

function labPrompt(topic: string, language: Language) {
  return `You are DevQuest AI. ${languageInstruction(language)} Generate a hands-on coding lab for: ${topic}
Respond with ONLY valid JSON.
Schema:
{
  "instructions": "markdown lab guide (250-500 words)",
  "boilerplateCode": "starter code",
  "testCode": "Jest tests importing the solution file when runnerMode is sandpack; otherwise a verification script or checklist",
  "fileName": "solution.js",
  "language": "javascript | typescript | python | shell | yaml",
  "runnerMode": "sandpack | manual",
  "entryFile": "solution.js",
  "testFile": "solution.test.js"
}
Rules:
- lab completable in 15-30 minutes
- include objective, requirements, hints, expected output
- choose the natural language for the topic
- use runnerMode sandpack only for JavaScript or TypeScript
- JavaScript/TypeScript testCode must use Jest and import ./solution
- never place the expected implementation inside testCode
- boilerplate must parse and run as-is
- include at least 3 independently named tests`;
}

function practicePrompt(topic: string, language: Language) {
  return `You are DevQuest AI. ${languageInstruction(language)} Generate a focused practice session about: ${topic}
Respond with ONLY valid JSON.
Schema:
{
  "title": "session title",
  "cheatSheet": "focused markdown summary (500-800 words)",
  "quizzes": [{ "question": "...", "codeSnippet": "optional", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "...", "hint": "short conceptual hint without revealing the answer" }]
}
Rules:
- exactly 3 quizzes
- at least 2 quizzes with codeSnippet
- no simple recall questions
- every quiz must include a useful hint that does not reveal or eliminate the answer`;
}

function dailyChallengePrompt(topic: string, language: Language) {
  return `You are DevQuest AI. ${languageInstruction(language)} Generate today's practical coding challenge about: ${topic}
Respond with ONLY valid JSON.
Schema:
{
  "title": "short daily challenge title",
  "cheatSheet": "concise markdown refresher (250-400 words)",
  "quizzes": [{ "question": "...", "codeSnippet": "optional", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "...", "hint": "short conceptual hint without revealing the answer" }]
}
Rules:
- exactly 5 quizzes
- at least 3 quizzes with codeSnippet
- mix debugging, code output, application, and tradeoff questions
- avoid simple definition recall
- explanations must be concise and useful
- every quiz must include a useful hint that does not reveal or eliminate the answer`;
}

function assessmentPrompt(topic: string, language: Language) {
  return `You are DevQuest AI. ${languageInstruction(language)} Create a placement assessment covering these three introductory skill nodes: ${topic}
Respond with ONLY valid JSON.
Schema:
{
  "title": "Skill Assessment",
  "cheatSheet": "one short paragraph explaining that this is a placement test",
  "quizzes": [{ "question": "...", "codeSnippet": "optional", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "...", "hint": "short conceptual hint without revealing the answer" }]
}
Rules:
- exactly 5 practical questions
- collectively cover all three supplied nodes
- at least 3 questions must use code, commands, configuration, or concrete scenarios
- difficulty should verify working knowledge, not obscure trivia
- explanations must teach why the answer is correct
- every quiz must include a useful hint that does not reveal or eliminate the answer`;
}

function masterPrompt(topic: string, language: Language) {
  return `You are DevQuest AI. ${languageInstruction(language)} Generate a master-level speed challenge about: ${topic}
Respond with ONLY valid JSON.
Schema:
{
  "title": "challenge title",
  "cheatSheet": "brief markdown refresher (250-450 words)",
  "quizzes": [{ "question": "...", "codeSnippet": "required", "options": ["A","B","C","D"], "correctIndex": 0, "explanation": "...", "hint": "short conceptual hint without revealing the answer" }]
}
Rules:
- exactly 10 quizzes
- every quiz must include codeSnippet
- difficulty: senior developer practical scenarios
- favor debugging, edge cases, tricky behavior, and tradeoffs
- every quiz must include a useful hint that does not reveal or eliminate the answer`;
}

function flashcardsPrompt(topic: string, language: Language) {
  return `You are DevQuest AI. ${languageInstruction(language)} Generate flashcards for: ${topic}
Respond with ONLY valid JSON.
Schema:
[
  { "front": "short question", "back": "clear answer", "codeSnippet": "optional" }
]
Rules:
- generate 10 to 15 flashcards
- keep front concise and back high-value
- include codeSnippet when code clarifies the idea`;
}

function evaluatePrompt(topic: string, explanation: string, language: Language) {
  return `You are DevQuest AI evaluating a student's explanation. ${languageInstruction(language)}
Topic: ${topic}
Student explanation: ${explanation}
Respond with ONLY valid JSON.
Schema:
{
  "score": 1,
  "summary": "2-4 sentence evaluation",
  "missingConcepts": ["concept 1", "concept 2"]
}
Rules:
- score from 1 to 10
- be strict but constructive
- missingConcepts should list the most important omissions`;
}

function buildPrompt(type: RequestType, topic: string, depth: Depth, language: Language, explanation?: string) {
  if (type === 'lab') return labPrompt(topic, language);
  if (type === 'practice') return practicePrompt(topic, language);
  if (type === 'daily-challenge') return dailyChallengePrompt(topic, language);
  if (type === 'assessment') return assessmentPrompt(topic, language);
  if (type === 'master') return masterPrompt(topic, language);
  if (type === 'flashcards') return flashcardsPrompt(topic, language);
  if (type === 'evaluate-teachback') return evaluatePrompt(topic, explanation ?? '', language);
  return lessonPrompt(topic, depth, language);
}

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function encryptionKey(secret: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', digest, 'AES-GCM', false, ['encrypt', 'decrypt']);
}

async function encryptApiKey(apiKey: string, secret: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await encryptionKey(secret);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(apiKey));
  return { encryptedKey: bytesToBase64(new Uint8Array(encrypted)), iv: bytesToBase64(iv) };
}

async function decryptApiKey(encryptedKey: string, iv: string, secret: string) {
  const key = await encryptionKey(secret);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(iv) }, key, base64ToBytes(encryptedKey));
  return new TextDecoder().decode(decrypted);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const encryptionSecret = Deno.env.get('USER_KEY_ENCRYPTION_SECRET');

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) return jsonResponse({ error: 'Supabase env missing' }, 500);
  if (!encryptionSecret) return jsonResponse({ error: 'Encryption secret missing' }, 500);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Missing authorization' }, 401);

  const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return jsonResponse({ error: 'Unauthorized' }, 401);

  const body = await req.json() as ProxyBody;
  const action = body.action ?? 'generate';
  const admin = createClient(supabaseUrl, serviceRoleKey);

  if (action === 'save-key') {
    const apiKey = body.apiKey?.trim();
    if (!apiKey || apiKey.length < 20) return jsonResponse({ error: 'Invalid Gemini API key' }, 400);
    const encrypted = await encryptApiKey(apiKey, encryptionSecret);
    const { error: saveError } = await admin.from('user_gemini_keys').upsert({
      user_id: data.user.id,
      encrypted_key: encrypted.encryptedKey,
      iv: encrypted.iv,
      updated_at: new Date().toISOString(),
    });
    if (saveError) return jsonResponse({ error: saveError.message }, 500);
    return jsonResponse({ saved: true, hasKey: true });
  }

  if (action === 'key-status') {
    const { data: keyRow } = await admin.from('user_gemini_keys').select('user_id').eq('user_id', data.user.id).maybeSingle();
    return jsonResponse({ hasKey: Boolean(keyRow) });
  }

  if (action === 'delete-key') {
    const { error: deleteError } = await admin.from('user_gemini_keys').delete().eq('user_id', data.user.id);
    if (deleteError) return jsonResponse({ error: deleteError.message }, 500);
    return jsonResponse({ deleted: true, hasKey: false });
  }

  const topic = body.topic?.trim();
  const explanation = body.explanation?.trim();
  const type = body.type ?? 'lesson';
  const model = body.model?.trim() || 'gemini-3-flash-preview';
  const depth = body.depth ?? 'deepen';
  const language = body.language ?? 'en';

  if ((type !== 'evaluate-teachback' && !topic) || (type === 'evaluate-teachback' && (!topic || !explanation))) {
    return jsonResponse({ error: 'Missing topic or explanation' }, 400);
  }

  const { data: keyRow, error: keyError } = await admin
    .from('user_gemini_keys')
    .select('encrypted_key, iv')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (keyError) return jsonResponse({ error: keyError.message }, 500);
  if (!keyRow) return jsonResponse({ error: 'USER_GEMINI_KEY_MISSING' }, 400);

  let geminiApiKey: string;
  try {
    geminiApiKey = await decryptApiKey(keyRow.encrypted_key, keyRow.iv, encryptionSecret);
  } catch {
    return jsonResponse({ error: 'Unable to decrypt Gemini key' }, 500);
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(type, topic ?? '', depth, language, explanation) }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return jsonResponse({ error: errorText }, response.status);
  }

  const gemini = await response.json();
  const text = gemini?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return jsonResponse({ error: 'Empty Gemini response' }, 502);

  return jsonResponse({ text });
});
