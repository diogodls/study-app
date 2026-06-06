import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type RequestType = 'lesson' | 'lab' | 'practice';

type ProxyBody = {
  action?: 'generate' | 'save-key' | 'key-status' | 'delete-key';
  apiKey?: string;
  topic?: string;
  model?: string;
  type?: RequestType;
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

const lessonPrompt = (topic: string) => `You are DevQuest AI, an expert computer science tutor for working developers.

Generate a concise, practical lesson about: ${topic}

Respond with ONLY valid JSON - no markdown fences, no prose outside the JSON object.

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
- Escape all special characters in JSON strings
- No trailing commas`;

const labPrompt = (topic: string) => `You are DevQuest AI. Generate a hands-on coding lab for: ${topic}

Respond with ONLY valid JSON - no markdown fences, no prose outside the JSON object.

Required schema:
{
  "instructions": "markdown lab guide (200-400 words). Include: Objective, What You'll Build, Requirements, Hints, and Expected Output.",
  "boilerplateCode": "starter code with clear TODO comments marking exactly what to implement.",
  "testCode": "self-contained test cases the student runs to verify their solution. Include at least 3 test cases.",
  "fileName": "suggested filename e.g. solution.js or solution.py",
  "language": "javascript"
}

Rules:
- Lab completable in 15-30 minutes
- boilerplateCode must compile/run as-is
- testCode must be runnable independently
- language must be one of javascript, typescript, python`;

const practicePrompt = (topic: string) => `You are DevQuest AI. Generate a focused practice session about: ${topic}

Respond with ONLY valid JSON - no markdown fences, no prose outside the JSON object.

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
- correctIndex: integer 0-3`;

function buildPrompt(type: RequestType, topic: string) {
  if (type === 'lab') return labPrompt(topic);
  if (type === 'practice') return practicePrompt(topic);
  return lessonPrompt(topic);
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
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(apiKey),
  );
  return {
    encryptedKey: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
  };
}

async function decryptApiKey(encryptedKey: string, iv: string, secret: string) {
  const key = await encryptionKey(secret);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(iv) },
    key,
    base64ToBytes(encryptedKey),
  );
  return new TextDecoder().decode(decrypted);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const encryptionSecret = Deno.env.get('USER_KEY_ENCRYPTION_SECRET');

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return jsonResponse({ error: 'Supabase env missing' }, 500);
  }
  if (!encryptionSecret) return jsonResponse({ error: 'Encryption secret missing' }, 500);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return jsonResponse({ error: 'Missing authorization' }, 401);

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
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
    const { data: keyRow } = await admin
      .from('user_gemini_keys')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();
    return jsonResponse({ hasKey: Boolean(keyRow) });
  }

  if (action === 'delete-key') {
    const { error: deleteError } = await admin
      .from('user_gemini_keys')
      .delete()
      .eq('user_id', data.user.id);
    if (deleteError) return jsonResponse({ error: deleteError.message }, 500);
    return jsonResponse({ deleted: true, hasKey: false });
  }

  const topic = body.topic?.trim();
  const type = body.type ?? 'lesson';
  const model = body.model?.trim() || 'gemini-3-flash-preview';

  if (!topic) return jsonResponse({ error: 'Missing topic' }, 400);
  if (!['lesson', 'lab', 'practice'].includes(type)) return jsonResponse({ error: 'Invalid type' }, 400);

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

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(type, topic) }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    return jsonResponse({ error: errorText }, response.status);
  }

  const gemini = await response.json();
  const text = gemini?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return jsonResponse({ error: 'Empty Gemini response' }, 502);

  return jsonResponse({ text });
});
