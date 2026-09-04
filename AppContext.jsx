import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, Info, Trophy, X } from 'lucide-react';
import { storage, KEYS, sha256, uid, logActivity } from '../services/storage';
import { evaluateAchievements, getUnlocked } from '../services/gamification';
import { computeAll } from '../services/analyticsService';

const AppCtx = createContext(null);
export const useApp = () => useContext(AppCtx);

/* ---------- Local MVP auth (honest about its limits) ---------- */
function getAccounts() { return storage.get(KEYS.accounts, []); }

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const email = storage.get(KEYS.session);
    return email ? getAccounts().find((a) => a.email === email) || null : null;
  });
  const [theme, setTheme] = useState(() => storage.get(KEYS.theme) || 'light');
  const [settings, setSettings] = useState(() => storage.get(KEYS.settings, { ttsRate: 1, ttsVoice: null, notif: true, ttsEnabled: true }));
  const [toasts, setToasts] = useState([]);
  const [statsVersion, setStatsVersion] = useState(0);
  const toastId = useRef(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    storage.set(KEYS.theme, theme);
  }, [theme]);

  const toast = useCallback((type, title, msg) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, type, title, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200);
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  const register = useCallback(async ({ name, email, password }) => {
    email = email.trim().toLowerCase();
    const accounts = getAccounts();
    if (accounts.some((a) => a.email === email)) throw new Error('An account with this email already exists.');
    const salt = uid();
    const passHash = await sha256(salt + password);
    const account = {
      id: uid(), name: name.trim(), email, salt, passHash, createdAt: Date.now(),
      profile: { targetRole: '', skills: [], education: '', bio: '' },
    };
    storage.set(KEYS.accounts, [...accounts, account]);
    storage.set(KEYS.session, email);
    setUser(account);
    logActivity('account', 'Created account');
    return account;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    email = email.trim().toLowerCase();
    const account = getAccounts().find((a) => a.email === email);
    if (!account) throw new Error('No account found with this email.');
    const hash = await sha256(account.salt + password);
    if (hash !== account.passHash) throw new Error('Incorrect password.');
    storage.set(KEYS.session, email);
    setUser(account);
    return account;
  }, []);

  const logout = useCallback(() => {
    storage.remove(KEYS.session);
    setUser(null);
  }, []);

  const updateProfile = useCallback((patch) => {
    const accounts = getAccounts();
    const idx = accounts.findIndex((a) => a.email === user?.email);
    if (idx === -1) return;
    accounts[idx] = { ...accounts[idx], ...patch, profile: { ...accounts[idx].profile, ...(patch.profile || {}) } };
    storage.set(KEYS.accounts, accounts);
    setUser(accounts[idx]);
  }, [user]);

  const saveSettings = useCallback((patch) => {
    setSettings((s) => {
      const next = { ...s, ...patch };
      storage.set(KEYS.settings, next);
      return next;
    });
  }, []);

  /** Call after saving activity — recomputes achievements & bumps stats. */
  const commitActivity = useCallback((kind, label) => {
    logActivity(kind, label);
    const stats = computeAll();
    const fresh = evaluateAchievements(stats);
    fresh.forEach((a) => toast('gold', `Achievement unlocked — ${a.title}`, a.desc));
    setStatsVersion((v) => v + 1);
  }, [toast]);

  const stats = useMemo(() => computeAll(), [statsVersion, user]);
  const achievements = useMemo(() => getUnlocked(), [statsVersion]);
  const refreshStats = useCallback(() => setStatsVersion((v) => v + 1), []);

  const value = {
    user, register, login, logout, updateProfile,
    theme, toggleTheme, toast,
    settings, saveSettings,
    stats, achievements, commitActivity, refreshStats,
  };

  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <AppCtx.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </AppCtx.Provider>
  );
}

const TOAST_META = {
  success: { icon: CheckCircle2, bar: 'from-emerald-500 to-teal-400' },
  error: { icon: AlertTriangle, bar: 'from-rose-500 to-orange-400' },
  info: { icon: Info, bar: 'from-blue-500 to-cyan-400' },
  gold: { icon: Trophy, bar: 'from-yellow-400 to-orange-400' },
};

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const M = TOAST_META[t.type] || TOAST_META.info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-700/60 dark:bg-slate-900"
            >
              <div className={`h-1 w-full bg-gradient-to-r ${M.bar}`} />
              <div className="flex items-start gap-3 p-3.5">
                <M.icon size={20} className="mt-0.5 shrink-0 text-slate-700 dark:text-slate-200" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</p>
                  {t.msg && <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{t.msg}</p>}
                </div>
                <button onClick={() => onDismiss?.(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Dismiss">
                  <X size={15} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
