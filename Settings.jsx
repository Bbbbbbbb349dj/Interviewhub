import React, { useEffect, useRef, useState } from 'react';
import {
  Sun, Moon, KeyRound, ShieldCheck, Volume2, Bell, Database, Download, Upload,
  Trash2, CheckCircle2, AlertTriangle, Eye, EyeOff, PlugZap,
} from 'lucide-react';
import { Page, Container, FeatureHeader } from '../components/layout';
import { Card, Btn, Badge, Field, Select, Toggle, Modal, inputCls } from '../components/ui';
import { FEATURES } from '../constants';
import { useApp } from '../context/AppContext';
import { byok, getAIConfig, aiProviderLabel, askJSON } from '../services/aiService';
import { exportAllData, importAllData, storage } from '../services/storage';
import { ttsSupported, speak } from '../hooks/useSpeech';

export default function Settings() {
  const { theme, toggleTheme, settings, saveSettings, toast } = useApp();
  const [openai, setOpenai] = useState('');
  const [gemini, setGemini] = useState('');
  const [showKeys, setShowKeys] = useState(false);
  const [testing, setTesting] = useState(false);
  const [voices, setVoices] = useState([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef(null);
  const cfg = getAIConfig();

  useEffect(() => {
    if (!ttsSupported()) return;
    const load = () => setVoices(window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en')));
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const saveKeys = () => {
    if (openai.trim() || gemini.trim()) {
      byok.set({ openai: openai.trim() || undefined, gemini: gemini.trim() || undefined });
      setOpenai(''); setGemini('');
      toast('success', 'AI key saved for this session', getAIConfig() ? `Active provider: ${aiProviderLabel()}` : 'Key stored in session memory only.');
    } else {
      toast('info', 'Nothing to save', 'Paste a key first.');
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const r = await askJSON('Respond with JSON: {"ok":true}', 'Ping');
      toast(r.ok ? 'success' : 'info', 'Connection successful', `${aiProviderLabel()} responded correctly.`);
    } catch (e) {
      toast('error', 'Connection failed', e.message);
    } finally {
      setTesting(false);
    }
  };

  const doExport = () => {
    const blob = new Blob([JSON.stringify(exportAllData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interviewhub-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Data exported', 'A JSON backup of all your local data was downloaded.');
  };

  const doImport = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      importAllData(JSON.parse(text));
      toast('success', 'Data imported', 'Reloading to apply your data…');
      setTimeout(() => window.location.reload(), 900);
    } catch (e) {
      toast('error', 'Import failed', e.message || 'That file is not a valid InterviewHub export.');
    }
  };

  const doClear = () => {
    storage.clearAll();
    setConfirmClear(false);
    toast('info', 'Local data cleared', 'Everything stored by InterviewHub in this browser was removed.');
    setTimeout(() => { window.location.href = '#/auth'; window.location.reload(); }, 900);
  };

  return (
    <Page>
      <Container className="max-w-3xl space-y-6 pt-8">
        <FeatureHeader feature="analytics" title="Settings" desc="Theme, AI provider, voice and full control over your data." />

        {/* Appearance */}
        <Card className="p-6">
          <SectionTitle icon={theme === 'dark' ? Moon : Sun} title="Appearance" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[['light', Sun, 'Light', 'Bright, colorful surfaces'], ['dark', Moon, 'Dark', 'Cinematic deep neutrals']].map(([m, Icon, l, d]) => (
              <button
                key={m}
                onClick={() => theme !== m && toggleTheme()}
                className={`rounded-2xl border-2 p-4 text-left transition-all ${theme === m ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-400/10' : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'}`}
              >
                <Icon size={18} className={theme === m ? 'text-cyan-500' : 'text-slate-400'} />
                <p className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">{l}</p>
                <p className="text-xs text-slate-400">{d}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* AI provider */}
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionTitle icon={KeyRound} title="AI provider" />
            <Badge className={cfg ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500'}>
              {cfg ? <><CheckCircle2 size={12} /> Active: {aiProviderLabel()}</> : <><AlertTriangle size={12} /> No key configured</>}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Interviews, resume deep-analysis and code review call a real LLM. Paste a key below — it is kept in <b>session memory only</b> (wiped when this tab closes) and sent only to the provider you choose. Keys are <b>never</b> written to LocalStorage.
          </p>
          <div className="mt-5 grid gap-4">
            <Field label="OpenAI API key" hint="Preferred provider when present. e.g. sk-…">
              <div className="relative">
                <input type={showKeys ? 'text' : 'password'} value={openai} onChange={(e) => setOpenai(e.target.value)} placeholder={byok.has() ? 'A session key is already stored' : 'sk-…'} className={`${inputCls} pr-12`} autoComplete="off" />
                <button type="button" onClick={() => setShowKeys(!showKeys)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-label="Toggle key visibility">{showKeys ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </Field>
            <Field label="Google Gemini API key" hint="Used when no OpenAI key is present.">
              <input type={showKeys ? 'text' : 'password'} value={gemini} onChange={(e) => setGemini(e.target.value)} placeholder="AIza…" className={inputCls} autoComplete="off" />
            </Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Btn size="sm" icon={ShieldCheck} onClick={saveKeys}>Save for this session</Btn>
            <Btn size="sm" variant="outline" icon={PlugZap} onClick={testConnection} loading={testing} disabled={!cfg}>Test connection</Btn>
            {byok.has() && <Btn size="sm" variant="ghost" className="text-rose-500" onClick={() => { byok.clear(); toast('info', 'Session keys cleared'); }}>Clear session keys</Btn>}
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            <b className="text-slate-700 dark:text-slate-200">Developers:</b> bake keys in at build time with <code className="rounded bg-slate-200 px-1.5 py-0.5 dark:bg-slate-700">VITE_OPENAI_API_KEY</code> / <code className="rounded bg-slate-200 px-1.5 py-0.5 dark:bg-slate-700">VITE_GEMINI_API_KEY</code> (see <code className="rounded bg-slate-200 px-1.5 py-0.5 dark:bg-slate-700">.env.example</code>). Note: keys bundled into a client build are visible to anyone with the bundle — for production, proxy through a server. Optional model overrides: <code className="rounded bg-slate-200 px-1.5 py-0.5 dark:bg-slate-700">VITE_OPENAI_MODEL</code>, <code className="rounded bg-slate-200 px-1.5 py-0.5 dark:bg-slate-700">VITE_GEMINI_MODEL</code>.
          </div>
        </Card>

        {/* Voice */}
        <Card className="p-6">
          <SectionTitle icon={Volume2} title="Voice & speech" />
          {!ttsSupported() && <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">This browser does not support speech synthesis — AI answers will be text-only.</p>}
          <div className="mt-4 space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Read AI questions aloud</p>
                <p className="text-xs text-slate-400">Text-to-speech during interviews</p>
              </div>
              <Toggle checked={settings.ttsEnabled} onChange={(v) => saveSettings({ ttsEnabled: v })} label="Read questions aloud" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm">
                <p className="font-semibold text-slate-700 dark:text-slate-200">Speech rate</p>
                <span className="font-mono text-xs text-slate-400">{settings.ttsRate}×</span>
              </div>
              <input type="range" min="0.6" max="1.4" step="0.1" value={settings.ttsRate} onChange={(e) => saveSettings({ ttsRate: +e.target.value })} className="mt-2 w-full" aria-label="Speech rate" />
            </div>
            {voices.length > 0 && (
              <Field label="Voice">
                <Select value={settings.ttsVoice || ''} onChange={(e) => saveSettings({ ttsVoice: e.target.value || null })}>
                  <option value="">System default</option>
                  {voices.slice(0, 14).map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
                </Select>
              </Field>
            )}
            <Btn size="sm" variant="outline" onClick={() => speak('Hi, I am Iris, your InterviewHub interviewer. Let us begin whenever you are ready.', { rate: settings.ttsRate, voiceURI: settings.ttsVoice })}>Preview voice</Btn>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <SectionTitle icon={Bell} title="Preferences" />
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Practice reminders</p>
              <p className="text-xs text-slate-400">Preference stored locally; used for in-app nudges</p>
            </div>
            <Toggle checked={settings.notif} onChange={(v) => saveSettings({ notif: v })} label="Practice reminders" />
          </div>
        </Card>

        {/* Data management */}
        <Card className="p-6">
          <SectionTitle icon={Database} title="Your data" />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Everything InterviewHub knows lives in this browser's LocalStorage. Back it up, move it, or wipe it.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Btn variant="outline" icon={Download} onClick={doExport}>Export JSON</Btn>
            <Btn variant="outline" icon={Upload} onClick={() => fileRef.current?.click()}>Import JSON</Btn>
            <Btn variant="danger" icon={Trash2} onClick={() => setConfirmClear(true)}>Clear all data</Btn>
          </div>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={(e) => { doImport(e.target.files?.[0]); e.target.value = ''; }} />
          <p className="mt-3 text-xs text-slate-400">Import validates the file structure before applying it. You will stay signed in after import.</p>
        </Card>

        <Modal open={confirmClear} onClose={() => setConfirmClear(false)} title="Clear everything?">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
            This permanently deletes your account, interviews, submissions, tests, resume analyses, achievements and settings from this browser. Export first if you want a backup.
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Btn variant="ghost" onClick={() => setConfirmClear(false)}>Keep my data</Btn>
            <Btn variant="danger" icon={Trash2} onClick={doClear}>Delete everything</Btn>
          </div>
        </Modal>
      </Container>
    </Page>
  );
}

function SectionTitle({ icon: Icon, title }) {
  return (
    <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-slate-900 dark:text-white">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-slate-600 to-slate-500 text-white"><Icon size={15} /></span>
      {title}
    </h3>
  );
}
