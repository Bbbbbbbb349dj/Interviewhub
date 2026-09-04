import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Shuffle, Send, CheckCircle2, AlertCircle, RefreshCcw, KeyRound, Sparkles,
  Gauge, BookOpen, Volume2, Timer,
} from 'lucide-react';
import { Page, Container, FeatureHeader } from '../components/layout';
import { Card, Btn, BtnLink, Badge, Ring, ScoreBar, ErrorState, inputCls } from '../components/ui';
import { FEATURES, COMM_PROMPTS } from '../constants';
import { useSpeechRecognition } from '../hooks/useSpeech';
import { aiConfigured, aiProviderLabel, askJSON, friendlyAIError, clamp } from '../services/aiService';
import { storage, KEYS, uid, fmtDuration, fmtDateTime } from '../services/storage';
import { useApp } from '../context/AppContext';

const F = FEATURES.communication;

/* Honest local metrics from the real transcript + real timing. */
export function localEvaluate(text, secs) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const n = words.length;
  if (n < 5) return null;
  const wpm = Math.max(20, Math.round((n / Math.max(3, secs)) * 60));
  const fillerMatches = text.match(/\b(um+|uh+|erm+|like|you know|basically|actually|literally|sort of|kind of)\b/gi) || [];
  const fillerRate = fillerMatches.length / n;
  const uniqueRatio = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ''))).size / n;
  const sentences = text.split(/[.?!]+/).filter((s) => s.trim().length > 2).length;
  const casual = (text.match(/\b(gonna|wanna|stuff|yeah|nah|dunno|lol|cuz)\b/gi) || []).length;

  const fluency = clamp(10 - Math.abs(wpm - 145) / 14, 1, 10);
  const clarity = clamp(10 - fillerRate * 45, 1, 10);
  const vocabulary = clamp(uniqueRatio * 14, 1, 10);
  const structure = n < 20 ? 4 : sentences >= 4 ? 9 : sentences >= 2 ? 7 : 5;
  const professionalism = clamp(10 - casual * 2 - fillerMatches.length * 0.4, 1, 10);
  const dims = { clarity, fluency, vocabulary, structure, professionalism };
  const overall = +Object.values(dims).reduce((a, v) => a + v, 0) / 5;
  return {
    mode: 'local',
    metrics: { wpm, fillers: fillerMatches.length, words: n, sentences, uniqueRatio: +(uniqueRatio * 100).toFixed(0) },
    scores: { ...dims, grammar: null, overall: +overall.toFixed(1) },
  };
}

export default function Communication() {
  const { commitActivity } = useApp();
  const [promptIdx, setPromptIdx] = useState(0);
  const [phase, setPhase] = useState('idle'); // idle | recording | evaluating | done
  const [typed, setTyped] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);
  const startRef = useRef(0);
  const timerRef = useRef(null);
  const sr = useSpeechRecognition();
  const prompt = COMM_PROMPTS[promptIdx];

  const sessions = storage.get(KEYS.comm, []);

  function beginRecording() {
    setError(null); setResult(null); setTyped('');
    const ok = sr.start();
    if (ok) {
      startRef.current = Date.now();
      setDuration(0);
      setPhase('recording');
      timerRef.current = setInterval(() => setDuration((Date.now() - startRef.current) / 1000), 500);
    }
  }

  function stopRecording() {
    sr.stop();
    clearInterval(timerRef.current);
    const secs = (Date.now() - startRef.current) / 1000;
    setDuration(secs);
    const text = sr.liveText;
    if (!text || text.trim().length < 3) {
      setPhase('idle');
      setError(new Error('No speech was captured. Check your microphone and try again.'));
      return;
    }
    evaluate(text, secs);
  }

  function submitTyped() {
    if (typed.trim().split(/\s+/).length < 5) {
      setError(new Error('Write at least a full sentence so the coach has something to evaluate.'));
      return;
    }
    evaluate(typed.trim(), Math.max(8, typed.trim().split(/\s+/).length * 0.45));
  }

  async function evaluate(text, secs) {
    setPhase('evaluating');
    const local = localEvaluate(text, secs) || {
      mode: 'local',
      metrics: { wpm: 0, fillers: 0, words: text.split(/\s+/).length, sentences: 1, uniqueRatio: 0 },
      scores: { clarity: 3, fluency: 3, vocabulary: 3, structure: 3, professionalism: 5, grammar: null, overall: 3.4 },
    };
    let finalResult = { ...local, transcript: text, ai: null };
    if (aiConfigured()) {
      try {
        const data = await askJSON(
          'You are an expert communication coach for job interviews. Evaluate the spoken answer strictly and return only valid JSON.',
          `Prompt given to the candidate: "${prompt.label}"\nDuration: ${Math.round(secs)}s\nTranscript of their real answer:\n"""\n${text.slice(0, 4000)}\n"""\nMeasured metrics (ground truth): ${JSON.stringify(local.metrics)}\n\nReturn JSON: {"scores":{"clarity":1-10,"grammar":1-10,"vocabulary":1-10,"fluency":1-10,"structure":1-10,"professionalism":1-10,"relevance":1-10,"overall":1-10},"feedback":"2-3 sentences of specific coaching","improved":"a stronger 3-4 sentence version of their answer","tips":["2-4 concrete drills"]}`,
        );
        finalResult = {
          ...local, mode: 'ai',
          scores: { ...local.scores, ...data.scores, overall: clamp(data.scores?.overall ?? local.scores.overall, 1, 10) },
          ai: { feedback: String(data.feedback || ''), improved: String(data.improved || ''), tips: [].concat(data.tips || []).map(String) },
          transcript: text,
        };
      } catch (e) {
        setError(new Error(`${friendlyAIError(e)} — showing local speech metrics instead.`));
      }
    }
    const record = {
      id: uid(), prompt: prompt.label, transcript: text.slice(0, 2000), durationSec: secs,
      mode: finalResult.mode, scores: finalResult.scores, metrics: finalResult.metrics,
      feedback: finalResult.ai?.feedback || null, ts: Date.now(),
    };
    storage.push(KEYS.comm, record);
    commitActivity('communication', `Speaking practice — "${prompt.label}" (${finalResult.scores.overall}/10)`);
    setResult(finalResult);
    setPhase('done');
  }

  const shufflePrompt = () => setPromptIdx((i) => (i + 1 + Math.floor(Math.random() * (COMM_PROMPTS.length - 1))) % COMM_PROMPTS.length);

  return (
    <Page>
      <Container className="max-w-4xl space-y-6 pt-8">
        <FeatureHeader feature="communication" />

        {/* Prompt card */}
        <Card className={`p-6 sm:p-7 ${F.soft}`}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your prompt</p>
              <h2 className="mt-1.5 font-display text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">"{prompt.label}"</h2>
              <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">{prompt.hint}</p>
            </div>
            <Btn variant="outline" size="sm" icon={Shuffle} onClick={shufflePrompt}>New prompt</Btn>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {COMM_PROMPTS.map((p, i) => (
              <button key={p.id} onClick={() => setPromptIdx(i)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${i === promptIdx ? 'bg-gradient-to-r from-pink-600 to-rose-500 text-white shadow' : 'bg-white/70 text-slate-500 hover:bg-white dark:bg-slate-800/70 dark:text-slate-300'}`}>
                {p.label.length > 34 ? p.label.slice(0, 34) + '…' : p.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Recorder */}
        {phase !== 'done' && (
          <Card className="p-6 text-center sm:p-8">
            {phase === 'recording' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <button onClick={stopRecording} aria-label="Stop recording" className={`mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br ${F.grad} text-white shadow-xl ${F.glowShadow} animate-pulsering`}>
                  <MicOff size={34} />
                </button>
                <div className="mx-auto mt-5 flex h-8 max-w-xs items-end justify-center gap-1" aria-hidden="true">
                  {[0.4, 0.9, 0.6, 1, 0.5, 0.8, 0.35, 0.75, 0.55, 0.95, 0.45, 0.7].map((d, i) => (
                    <span key={i} className="eq-bar w-1.5 rounded-full bg-gradient-to-t from-pink-600 to-rose-400" style={{ height: '100%', animationDelay: `${i * 0.07}s` }} />
                  ))}
                </div>
                <p className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">{fmtDuration(duration)}</p>
                <p className="text-sm text-pink-500">Listening… tap the mic to finish</p>
                <div className="mx-auto mt-5 min-h-[70px] max-w-xl rounded-xl bg-slate-50 p-4 text-left text-sm leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                  {sr.liveText || <span className="text-slate-400">Start speaking — your words appear here live…</span>}
                </div>
                {sr.error && <p className="mt-2 text-xs font-medium text-rose-500">{sr.error}</p>}
              </motion.div>
            ) : phase === 'evaluating' ? (
              <div className="py-6">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }} className="mx-auto w-max text-pink-500"><RefreshCcw size={30} /></motion.div>
                <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">Analyzing your answer…</p>
                <p className="text-xs text-slate-400">{aiConfigured() ? `Deep coaching via ${aiProviderLabel()}` : 'Computing local speech metrics'}</p>
              </div>
            ) : (
              <>
                {sr.supported ? (
                  <button onClick={beginRecording} aria-label="Start recording" className={`mx-auto grid h-24 w-24 place-items-center rounded-full bg-slate-100 text-slate-400 transition-all hover:scale-105 hover:bg-gradient-to-br ${F.grad} hover:text-white hover:shadow-xl dark:bg-slate-800`}>
                    <Mic size={34} />
                  </button>
                ) : (
                  <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-slate-100 text-slate-300 dark:bg-slate-800"><MicOff size={34} /></div>
                )}
                <p className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                  {sr.supported ? 'Tap and speak your answer' : 'Speech recognition unavailable in this browser'}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {sr.supported ? `Real transcription, real metrics${aiConfigured() ? ', real AI coaching' : ''}.` : 'Use the typed fallback below — analysis still runs.'}
                </p>
                {!sr.supported && (
                  <div className="mx-auto mt-5 max-w-xl">
                    <textarea rows={4} value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type your answer here…" className={`${inputCls} resize-none`} aria-label="Typed answer" />
                    <Btn className="mt-3" grad={F.btnGrad} icon={Send} onClick={submitTyped}>Evaluate my answer</Btn>
                  </div>
                )}
              </>
            )}
            {error && <div className="mx-auto mt-4 max-w-xl text-left"><ErrorState message={error.message} /></div>}
            {phase === 'idle' && !aiConfigured() && (
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                <KeyRound size={13} /> Local metrics mode — <BtnLink to="/settings" size="sm" variant="ghost" className="!px-1 !py-0 text-pink-500">add an AI key</BtnLink> for coaching-level feedback.
              </p>
            )}
          </Card>
        )}

        {/* Results */}
        <AnimatePresence>
          {phase === 'done' && result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-[280px_1fr]">
                <Card className="p-7 text-center">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Overall</p>
                  <div className="mt-3 flex justify-center">
                    <Ring value={result.scores.overall * 10} size={150} from="#ec4899" to="#fb7185" label={result.scores.overall} sub="/ 10" />
                  </div>
                  <Badge className={`mt-3 ${result.mode === 'ai' ? 'bg-pink-500/10 text-pink-600 dark:text-pink-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {result.mode === 'ai' ? <><Sparkles size={11} /> AI coach evaluation</> : 'Local speech metrics'}
                  </Badge>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                    {[['Pace', `${result.metrics.wpm} wpm`, Gauge], ['Fillers', result.metrics.fillers, Volume2], ['Words', result.metrics.words, BookOpen]].map(([l, v]) => (
                      <div key={l} className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
                        <p className="font-display text-base font-bold text-pink-600 dark:text-pink-400">{v}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">{l}</p>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-7">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Coaching breakdown</h3>
                  <div className="mt-5 space-y-4">
                    {[
                      ['Clarity', result.scores.clarity], ['Fluency & pace', result.scores.fluency],
                      ['Vocabulary', result.scores.vocabulary], ['Structure', result.scores.structure],
                      ['Professionalism', result.scores.professionalism],
                      result.scores.grammar != null ? ['Grammar', result.scores.grammar] : null,
                      result.scores.relevance != null ? ['Relevance to prompt', result.scores.relevance] : null,
                    ].filter(Boolean).map(([l, v], i) => <ScoreBar key={l} label={l} value={v} max={10} delay={i * 0.06} />)}
                  </div>
                  {result.scores.grammar == null && (
                    <p className="mt-3 text-xs text-slate-400">Grammar scoring needs the AI coach — local mode can't judge it honestly.</p>
                  )}
                </Card>
              </div>

              {result.ai && (
                <Card className="p-7">
                  <div className="space-y-4">
                    {result.ai.feedback && (
                      <div className="rounded-xl bg-pink-50 p-4 text-sm leading-relaxed text-pink-900 dark:bg-pink-500/10 dark:text-pink-100">
                        <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-pink-500"><Sparkles size={12} /> Coach feedback</p>
                        {result.ai.feedback}
                      </div>
                    )}
                    {result.ai.tips?.length > 0 && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {result.ai.tips.map((t) => (
                          <div key={t} className="flex items-start gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-600 dark:border-slate-700/60 dark:text-slate-300"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" /> {t}</div>
                        ))}
                      </div>
                    )}
                    {result.ai.improved && (
                      <details className="rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
                        <summary className="cursor-pointer font-bold text-slate-700 dark:text-slate-200">A stronger version of your answer</summary>
                        <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">{result.ai.improved}</p>
                      </details>
                    )}
                  </div>
                </Card>
              )}

              <Card className="p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Your transcript</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{result.transcript}</p>
              </Card>

              <div className="flex gap-3">
                <Btn grad={F.btnGrad} icon={RefreshCcw} onClick={() => { setPhase('idle'); setResult(null); setTyped(''); }}>Practice again</Btn>
                <Btn variant="outline" icon={Shuffle} onClick={() => { shufflePrompt(); setPhase('idle'); setResult(null); }}>New prompt</Btn>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {phase !== 'done' && sessions.length > 0 && (
          <Card className="p-6">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Recent sessions</h3>
            <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
              {[...sessions].reverse().slice(0, 5).map((s) => (
                <li key={s.id} className="flex items-center gap-4 py-2.5 text-sm">
                  <Badge className={`${F.soft} ${F.text}`}>{s.scores?.overall ?? '—'}/10</Badge>
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-200">{s.prompt}</span>
                  <span className="text-xs text-slate-400">{fmtDateTime(s.ts)}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </Container>
    </Page>
  );
}
