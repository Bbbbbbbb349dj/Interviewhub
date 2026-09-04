/* Real AI service — OpenAI (preferred) or Google Gemini.
 * Keys come from build env (VITE_OPENAI_API_KEY / VITE_GEMINI_API_KEY)
 * or a user-supplied session key (BYOK) that is held in sessionStorage
 * only — never written to localStorage and never shipped in source. */

const SS_OPENAI = 'ihub:key:openai';
const SS_GEMINI = 'ihub:key:gemini';

export const byok = {
  set({ openai, gemini }) {
    if (openai !== undefined) {
      openai ? sessionStorage.setItem(SS_OPENAI, openai.trim()) : sessionStorage.removeItem(SS_OPENAI);
    }
    if (gemini !== undefined) {
      gemini ? sessionStorage.setItem(SS_GEMINI, gemini.trim()) : sessionStorage.removeItem(SS_GEMINI);
    }
  },
  clear() {
    sessionStorage.removeItem(SS_OPENAI);
    sessionStorage.removeItem(SS_GEMINI);
  },
  has() {
    return Boolean(sessionStorage.getItem(SS_OPENAI) || sessionStorage.getItem(SS_GEMINI));
  },
};

export function getAIConfig() {
  const openai = sessionStorage.getItem(SS_OPENAI) || import.meta.env.VITE_OPENAI_API_KEY || '';
  const gemini = sessionStorage.getItem(SS_GEMINI) || import.meta.env.VITE_GEMINI_API_KEY || '';
  if (openai) {
    return {
      provider: 'openai', key: openai,
      model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
    };
  }
  if (gemini) {
    return {
      provider: 'gemini', key: gemini,
      model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash',
    };
  }
  return null;
}

export const aiConfigured = () => Boolean(getAIConfig());
export const aiProviderLabel = () => {
  const c = getAIConfig();
  if (!c) return null;
  return c.provider === 'openai' ? `OpenAI · ${c.model}` : `Gemini · ${c.model}`;
};

export class AIError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function mapHttpError(status, bodyText) {
  let detail = '';
  try { detail = JSON.parse(bodyText)?.error?.message || ''; } catch { detail = bodyText?.slice(0, 160) || ''; }
  if (status === 401 || status === 403) return new AIError('AUTH', `Invalid or unauthorized API key. ${detail}`);
  if (status === 429) return new AIError('RATE_LIMIT', `Rate limit reached. Please wait and retry. ${detail}`);
  if (status === 404) return new AIError('MODEL', `Model not found. Check your model name. ${detail}`);
  if (status >= 500) return new AIError('SERVER', `AI provider error (${status}). ${detail}`);
  return new AIError('HTTP', `AI request failed (${status}). ${detail}`);
}

async function post(url, options, timeoutMs = 90000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    if (!res.ok) throw mapHttpError(res.status, await res.text().catch(() => ''));
    return await res.json();
  } catch (e) {
    if (e instanceof AIError) throw e;
    if (e.name === 'AbortError') throw new AIError('TIMEOUT', 'The AI took too long to respond. Please retry.');
    throw new AIError('NETWORK', 'Network error while contacting the AI provider. Check your connection.');
  } finally {
    clearTimeout(t);
  }
}

async function callOpenAI(cfg, system, user, wantJson) {
  const body = {
    model: cfg.model,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    temperature: 0.7,
  };
  if (wantJson) body.response_format = { type: 'json_object' };
  const data = await post('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.key}` },
    body: JSON.stringify(body),
  });
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new AIError('BAD_RESPONSE', 'OpenAI returned an empty response.');
  return text;
}

async function callGemini(cfg, system, user, wantJson) {
  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  };
  if (wantJson) body.generationConfig.responseMimeType = 'application/json';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent?key=${encodeURIComponent(cfg.key)}`;
  const data = await post(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('');
  if (!text) throw new AIError('BAD_RESPONSE', 'Gemini returned an empty response.');
  return text;
}

/* Tolerant JSON extraction: strips code fences, finds the outermost object. */
export function extractJSON(text) {
  if (!text) throw new AIError('BAD_RESPONSE', 'Empty AI response.');
  let t = String(text).trim();
  t = t.replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new AIError('BAD_RESPONSE', 'AI did not return valid JSON.');
  }
  let candidate = t.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    try {
      candidate = candidate.replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(candidate);
    } catch {
      throw new AIError('BAD_RESPONSE', 'AI returned malformed JSON.');
    }
  }
}

/** ask(system, user, {json}) → object|string. Throws AIError on failure. */
export async function ask(system, user, { json = true } = {}) {
  const cfg = getAIConfig();
  if (!cfg) {
    throw new AIError('NO_KEY', 'No AI key configured. Add one in Settings or via VITE_OPENAI_API_KEY / VITE_GEMINI_API_KEY.');
  }
  const raw = cfg.provider === 'openai'
    ? await callOpenAI(cfg, system, user, json)
    : await callGemini(cfg, system, user, json);
  return json ? extractJSON(raw) : raw;
}

/** Ask with one automatic retry that demands corrected JSON. */
export async function askJSON(system, user) {
  try {
    return await ask(system, user, { json: true });
  } catch (e) {
    if (e.code === 'BAD_RESPONSE') {
      return ask(system, user + '\n\nIMPORTANT: respond with a single valid JSON object and nothing else.', { json: true });
    }
    throw e;
  }
}

/* ---------- Shared score normalisation ---------- */
export const clamp = (n, lo = 0, hi = 10) => Math.max(lo, Math.min(hi, Number.isFinite(+n) ? Math.round(+n) : 0));

export const SCORE_DIMS = [
  'technicalKnowledge', 'communication', 'confidence', 'accuracy',
  'completeness', 'problemSolving', 'grammar',
];

export function normalizeScores(raw = {}) {
  const out = {};
  SCORE_DIMS.forEach((d) => { out[d] = clamp(raw[d] ?? raw.overall ?? 0, 1, 10); });
  out.overall = clamp(
    raw.overall ?? Math.round(SCORE_DIMS.reduce((a, d) => a + out[d], 0) / SCORE_DIMS.length),
    1, 10,
  );
  return out;
}

export function friendlyAIError(e) {
  if (!(e instanceof AIError)) return 'Something went wrong while contacting the AI.';
  switch (e.code) {
    case 'NO_KEY': return 'No AI key configured.';
    case 'AUTH': return 'Your AI API key was rejected. Check it in Settings.';
    case 'RATE_LIMIT': return 'Rate limit reached — wait a moment and retry.';
    case 'NETWORK': return 'Network error contacting the AI provider.';
    case 'TIMEOUT': return 'The AI timed out. Please retry.';
    default: return e.message;
  }
}
