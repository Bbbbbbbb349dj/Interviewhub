/* LocalStorage persistence layer — the temporary "database" for this MVP. */

const PREFIX = 'ihub:';

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('storage set failed', e);
      return false;
    }
  },
  remove(key) {
    localStorage.removeItem(PREFIX + key);
  },
  update(key, updater, fallback = []) {
    const current = storage.get(key, fallback);
    const next = updater(current);
    storage.set(key, next);
    return next;
  },
  push(key, item, fallback = []) {
    return storage.update(key, (arr) => [...(Array.isArray(arr) ? arr : fallback), item], fallback);
  },
  clearAll() {
    const toDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) toDelete.push(k);
    }
    toDelete.forEach((k) => localStorage.removeItem(k));
  },
};

export const KEYS = {
  accounts: 'accounts',
  session: 'session',
  theme: 'theme',
  interviews: 'interviews',
  coding: 'codingAttempts',
  aptitude: 'aptitudeAttempts',
  comm: 'commSessions',
  resumes: 'resumeAnalyses',
  achievements: 'achievements',
  settings: 'settings',
  activity: 'activityLog',
};

export function logActivity(kind, label) {
  storage.push(KEYS.activity, { kind, label, ts: Date.now() });
}

export function exportAllData() {
  const out = { app: 'interviewhub', version: 1, exportedAt: new Date().toISOString(), data: {} };
  Object.values(KEYS).forEach((k) => {
    out.data[k] = storage.get(k);
  });
  return out;
}

export function importAllData(payload) {
  if (!payload || payload.app !== 'interviewhub' || typeof payload.data !== 'object') {
    throw new Error('Invalid InterviewHub export file.');
  }
  Object.values(KEYS).forEach((k) => {
    if (payload.data[k] !== undefined) storage.set(k, payload.data[k]);
  });
}

/* SHA-256 via WebCrypto for local demo authentication, with a non-crypto
 * fallback for non-secure contexts where crypto.subtle is unavailable. */
export async function sha256(text) {
  try {
    if (globalThis.crypto?.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch { /* fall through to fallback */ }
  // FNV-1a double-pass — demo-grade only (auth is local MVP anyway)
  let h1 = 0x811c9dc5, h2 = 0x01000193;
  for (let i = 0; i < text.length; i++) {
    h1 = Math.imul(h1 ^ text.charCodeAt(i), 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ text.charCodeAt(text.length - 1 - i), 0x85ebca6b) >>> 0;
  }
  return `fb_${h1.toString(16)}${h2.toString(16)}`;
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function fmtDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
export function fmtDateTime(ts) {
  return new Date(ts).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}
export function fmtDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
