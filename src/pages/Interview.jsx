import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Send, KeyRound, ArrowRight, Volume2, VolumeX, RefreshCcw,
  CheckCircle2, AlertCircle, Lightbulb, BookOpen, Clock, Sparkles, ChevronDown, ChevronUp, History as HistoryIcon,
} from 'lucide-react';
import { Page, Container, FeatureHeader } from '../components/layout';
import { Card, Btn, BtnLink, Badge, Field, Select, Ring, ScoreBar, ErrorState, EmptyState, Modal, inputCls } from '../components/ui';
import { FEATURES, INTERVIEW_TYPES, ROLES, DIFFICULTIES, QUESTION_COUNTS } from '../constants';
import { useSpeechRecognition, speak, stopSpeaking, ttsSupported } from '../hooks/useSpeech';
import { aiConfigured, aiProviderLabel, friendlyAIError } from '../services/aiService';
import * as interviewer from '../services/interviewService';
import { storage, KEYS, uid, fmtDuration } from '../services/storage';
import { useApp } from '../context/AppContext';

const F = FEATURES.interview;

export default function Interview() {
  const [params] = useSearchParams();
  const { settings, commitActivity, toast } = useApp();
  const [phase, setPhase] = useState('setup'); // setup | running | summary
  const [cfg, setCfg] = useState({
    type: params.get('type') || 'Technical',
    role: 'Frontend Developer',
    difficulty: 'Intermediate',
    count: 5,
  });
  const [greeting, setGreeting] = useState('');
  const [currentQ, setCurrentQ] = useState('');
  const [transcript, setTranscript] = useState([]); // {question, answer, feedback}
  const [answer, setAnswer] = useState('');
  const [pendingFeedback, setPendingFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [startTs, setStartTs] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [summary, setSummary] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const sr = useSpeechRecognition();
  const baseRef = useRef('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (phase === 'running') {
      const t = setInterval(() => setElapsed(((Date.now() - startTs) / 1000)), 1000);
      return () => clearInterval(t);
    }
  }, [phase, startTs]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [transcript, pendingFeedback, busy]);
  useEffect(() => () => stopSpeaking(), []);
  useEffect(() => {
    if (sr.listening) setAnswer(baseRef.current ? `${baseRef.current} ${sr.liveText}`.trim() : sr.liveText);
  }, [sr.liveText, sr.listening]);

  const liveAvg = useMemo(() => {
    const scored = transcript.filter((t) => t.feedback?.evaluation?.overall);
    if (!scored.length) return null;
    return (scored.reduce((a, t) => a + t.feedback.evaluation.overall, 0) / scored.length).toFixed(1);
  }, [transcript]);

  const toggleMic = () => {
    if (sr.listening) { sr.stop(); return; }
    stopSpeaking();
    baseRef.current = answer;
    sr.start();
  };

  const maybeSpeak = (text) => {
    if (settings.ttsEnabled && ttsSupported()) speak(text, { rate: settings.ttsRate, voiceURI: settings.ttsVoice });
  };

  /* ---------- Flow ---------- */
  async function handleStart() {
    setBusy(true); setError(null); setTranscript([]); setSummary(null); setAnswer(''); setPendingFeedback(null);
    try {
      const first = await interviewer.startInterview(cfg);
      setGreeting(first.greeting);
      setCurrentQ(first.question);
      setPhase('running');
      setStartTs(Date.now());
      setElapsed(0);
      maybeSpeak(`${first.greeting} ${first.question}`);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    const text = answer.trim();
    if (!text || busy) return;
    if (sr.listening) sr.stop();
    stopSpeaking();
    setBusy(true); setError(null);
    try {
      const isLast = transcript.length + 1 >= cfg.count;
      const fb = await interviewer.evaluateAnswer(cfg, transcript, currentQ, text, isLast);
      setTranscript((t) => [...t, { question: currentQ, answer: text, feedback: fb }]);
      setPendingFeedback(fb);
      setAnswer('');
      if (!isLast) maybeSpeak(fb.acknowledgement || 'Noted.');
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  function handleNext() {
    const fb = pendingFeedback;
    if (!fb) return;
    if (fb.nextQuestion) {
      setCurrentQ(fb.nextQuestion);
      setPendingFeedback(null);
      maybeSpeak(fb.nextQuestion);
    } else {
      finish(fb);
    }
  }

  async function finish(lastFeedback) {
    setPendingFeedback(null);
    setBusy(true);
    const durationSec = (Date.now() - startTs) / 1000;
    try {
      const full = lastFeedback ? [...transcript] : transcript;
      const ai = await interviewer.summarizeInterview(cfg, full).catch(() => null);
      const local = interviewer.localSummary(cfg, full, durationSec);
      const record = {
        id: uid(), ...cfg, startedAt: startTs, endedAt: Date.now(), durationSec,
        transcript: full, average: interviewer.averageScores(full),
        summary: ai || local, provider: aiProviderLabel(),
      };
      storage.push(KEYS.interviews, record);
      commitActivity('interview', `${cfg.type} interview — ${cfg.role} (${interviewer.averageScores(full)?.overall ?? '—'}/10)`);
      setSummary(record);
      setPhase('summary');
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }

  const qNum = Math.min(transcript.length + 1, cfg.count);

  /* ============================ SETUP ============================ */
  if (phase === 'setup') {
    return (
      <Page>
        <Container className="max-w-4xl space-y-8 pt-8">
          <FeatureHeader feature="interview" />
          {!aiConfigured() ? (
            <Card className="p-8 text-center">
              <span className={`mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${F.grad} text-white shadow-lg ${F.glowShadow}`}><KeyRound size={28} /></span>
              <h2 className="mt-5 font-display text-2xl font-bold text-slate-900 dark:text-white">Connect a real AI to begin</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                The interview is driven by a live LLM — questions are generated dynamically, adapted to your answers, and evaluated in real time. No canned scripts. Add your <b>OpenAI</b> or <b>Gemini</b> key to activate it.
              </p>
              <div className="mx-auto mt-6 max-w-md space-y-2 text-left">
                {['Open Settings below', 'Paste an OpenAI or Gemini API key (session-only — never written to disk)', 'Come back and start your interview'].map((s, i) => (
                  <div key={s} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/40 dark:text-slate-300">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-xs font-bold text-white">{i + 1}</span>{s}
                  </div>
                ))}
              </div>
              <div className="mt-7 flex justify-center gap-3">
                <BtnLink to="/settings">Open Settings <ArrowRight size={15} /></BtnLink>
                <Btn variant="outline" onClick={handleStart} disabled>Start Interview</Btn>
              </div>
              <p className="mt-4 text-xs text-slate-400">Developers: keys can also be baked in via VITE_OPENAI_API_KEY / VITE_GEMINI_API_KEY at build time.</p>
            </Card>
          ) : (
            <Card className="p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Configure your interview</h2>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={12} /> {aiProviderLabel()}</Badge>
              </div>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Interview type">
                  <Select value={cfg.type} onChange={(e) => setCfg({ ...cfg, type: e.target.value })}>
                    {INTERVIEW_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </Field>
                <Field label="Job role">
                  <Select value={cfg.role} onChange={(e) => setCfg({ ...cfg, role: e.target.value })}>
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </Select>
                </Field>
                <Field label="Difficulty">
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTIES.map((d) => (
                      <button key={d} onClick={() => setCfg({ ...cfg, difficulty: d })}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${cfg.difficulty === d ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300' : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Questions">
                  <div className="grid grid-cols-4 gap-2">
                    {QUESTION_COUNTS.map((n) => (
                      <button key={n} onClick={() => setCfg({ ...cfg, count: n })}
                        className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${cfg.count === n ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300' : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'}`}>
                        {n}
                      </button>
                    ))}
                    <input type="number" min={3} max={20} placeholder="Custom"
                      onChange={(e) => { const v = Math.max(3, Math.min(20, +e.target.value || 5)); setCfg({ ...cfg, count: v }); }}
                      className={`${inputCls} text-center`} aria-label="Custom question count" />
                  </div>
                </Field>
              </div>
              {error && <div className="mt-5"><ErrorState title="Could not start the interview" message={friendlyAIError(error)} onRetry={handleStart} /></div>}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Btn size="lg" grad={F.btnGrad} onClick={handleStart} loading={busy} icon={Mic}>
                  {busy ? 'Iris is preparing…' : 'Start Interview'}
                </Btn>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Sparkles size={15} className="text-cyan-500" /> Adaptive difficulty · voice or keyboard · per-answer scoring
                </div>
              </div>
            </Card>
          )}
        </Container>
      </Page>
    );
  }

  /* ============================ SUMMARY ============================ */
  if (phase === 'summary' && summary) {
    const s = summary.summary;
    return (
      <Page>
        <Container className="max-w-5xl space-y-6 pt-8">
          <FeatureHeader feature="interview" title="Interview complete" desc={`${summary.type} · ${summary.role} · ${summary.difficulty}`} />
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <Card className="p-7 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Overall performance</p>
              <div className="mt-4 flex justify-center">
                <Ring value={(summary.average?.overall ?? 0) * 10} size={170} from={F.hex} to="#2563eb" label={`${summary.average?.overall ?? '—'}`} sub="/ 10" />
              </div>
              <Badge className={`mt-4 px-4 py-1.5 text-xs ${(summary.average?.overall ?? 0) >= 7 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
                {s.hireReadiness}
              </Badge>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><p className="font-display text-lg font-bold text-slate-900 dark:text-white">{summary.transcript.length}</p><p className="text-[10px] font-bold uppercase text-slate-400">Questions</p></div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><p className="font-display text-lg font-bold text-slate-900 dark:text-white">{fmtDuration(summary.durationSec)}</p><p className="text-[10px] font-bold uppercase text-slate-400">Duration</p></div>
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><p className="font-display text-lg font-bold text-slate-900 dark:text-white">{summary.difficulty.slice(0, 4)}</p><p className="text-[10px] font-bold uppercase text-slate-400">Level</p></div>
              </div>
            </Card>

            <div className="space-y-6">
              <Card className="p-7">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Score breakdown</h3>
                <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {summary.average && ['technicalKnowledge', 'communication', 'confidence', 'accuracy', 'completeness', 'problemSolving', 'grammar'].map((d, i) => (
                    <ScoreBar key={d} label={interviewer.prettyDim(d)} value={summary.average[d]} max={10} delay={i * 0.06} />
                  ))}
                </div>
              </Card>
              <Card className="p-7">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Interviewer's verdict</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{s.summary}</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-500/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Strong areas</p>
                    <ul className="mt-2 space-y-1.5">{s.strongAreas.map((x) => <li key={x} className="flex gap-2 text-sm text-emerald-800 dark:text-emerald-200"><CheckCircle2 size={15} className="mt-0.5 shrink-0" />{x}</li>)}</ul>
                  </div>
                  <div className="rounded-xl bg-rose-50 p-4 dark:bg-rose-500/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Work on</p>
                    <ul className="mt-2 space-y-1.5">{s.weakAreas.map((x) => <li key={x} className="flex gap-2 text-sm text-rose-800 dark:text-rose-200"><AlertCircle size={15} className="mt-0.5 shrink-0" />{x}</li>)}</ul>
                  </div>
                </div>
                {s.recommendedPractice?.length > 0 && (
                  <div className="mt-4 rounded-xl bg-blue-50 p-4 dark:bg-blue-500/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Recommended practice</p>
                    <ul className="mt-2 space-y-1.5">{s.recommendedPractice.map((x) => <li key={x} className="flex gap-2 text-sm text-blue-800 dark:text-blue-200"><ArrowRight size={15} className="mt-0.5 shrink-0" />{x}</li>)}</ul>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Transcript recap */}
          <Card className="p-7">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Your answers</h3>
            <div className="mt-4 space-y-3">
              {summary.transcript.map((t, i) => (
                <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700/60">
                  <button className="flex w-full items-center gap-3 p-4 text-left" onClick={() => setExpanded(expanded === i ? null : i)}>
                    <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">Q{i + 1} · {t.feedback.evaluation.overall}/10</Badge>
                    <span className="flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">{t.question}</span>
                    {expanded === i ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </button>
                  {expanded === i && (
                    <div className="space-y-3 border-t border-slate-100 p-4 dark:border-slate-800">
                      <p className="text-sm text-slate-600 dark:text-slate-300"><b>Your answer:</b> {t.answer}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400"><b>Feedback:</b> {t.feedback.oneLineFeedback}</p>
                      {t.feedback.betterAnswer && <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"><b>Better version:</b> {t.feedback.betterAnswer}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Btn grad={F.btnGrad} icon={RefreshCcw} onClick={() => { setPhase('setup'); setSummary(null); setTranscript([]); }}>Interview again</Btn>
            <BtnLink to="/history" variant="outline" icon={HistoryIcon}>View history</BtnLink>
            <BtnLink to="/analytics" variant="ghost">See analytics</BtnLink>
          </div>
        </Container>
      </Page>
    );
  }

  /* ============================ RUNNING ============================ */
  return (
    <Page>
      <Container className="max-w-5xl pt-8">
        {/* Status bar */}
        <Card className={`overflow-hidden ${F.soft}`}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${F.grad} text-white shadow-md ${busy ? 'animate-pulse' : ''}`}><Mic size={18} /></span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Iris · {cfg.type}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{cfg.role} · {cfg.difficulty}</p>
              </div>
            </div>
            <Badge className="bg-white/70 text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">Question {qNum} / {cfg.count}</Badge>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300"><Clock size={15} /> {fmtDuration(elapsed)}</span>
            {liveAvg && (
              <span className="flex items-center gap-2 text-sm">
                <span className="text-slate-500 dark:text-slate-400">Live score</span>
                <span className={`font-display text-lg font-bold ${+liveAvg >= 7 ? 'text-emerald-500' : +liveAvg >= 5 ? 'text-amber-500' : 'text-rose-500'}`}>{liveAvg}</span>
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => { stopSpeaking(); useAppToggle(settings, commitActivity); }}
                className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800"
                aria-label="Voice settings quick toggle" title="Text-to-speech toggle in Settings; click to stop speaking"
              >
                {settings.ttsEnabled ? <Volume2 size={16} className="text-cyan-500" /> : <VolumeX size={16} />}
              </button>
              <Btn size="sm" variant="outline" onClick={() => setConfirmLeave(true)}>End</Btn>
            </div>
          </div>
          <div className="h-1 bg-slate-200/70 dark:bg-slate-700/50">
            <motion.div className={`h-full bg-gradient-to-r ${F.grad}`} animate={{ width: `${(transcript.length / cfg.count) * 100}%` }} transition={{ duration: 0.5 }} />
          </div>
        </Card>

        {/* Conversation */}
        <div className="mt-5 space-y-4">
          {greeting && (
            <ChatBubble who="ai">{greeting}</ChatBubble>
          )}
          {transcript.map((t, i) => (
            <React.Fragment key={i}>
              <ChatBubble who="ai">{t.question}</ChatBubble>
              <ChatBubble who="user">{t.answer}</ChatBubble>
              <FeedbackInline fb={t.feedback} index={i} latest={i === transcript.length - 1} />
            </React.Fragment>
          ))}
          {!pendingFeedback && (
            <ChatBubble who="ai" active>{currentQ}</ChatBubble>
          )}
          {busy && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex gap-1">
                {[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" style={{ animationDelay: `${d * 0.15}s` }} />)}
              </span>
              Iris is {transcript.length + 1 >= cfg.count && !pendingFeedback ? 'evaluating your final answer…' : 'listening and thinking…'}
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {error && <div className="mt-5"><ErrorState title="The AI hit a problem" message={friendlyAIError(error)} onRetry={() => setError(null)} /></div>}

        {/* Next question / finish or answer composer */}
        {pendingFeedback ? (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
            <Card className={`p-6 ${F.soft}`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Ring value={pendingFeedback.evaluation.overall * 10} size={74} stroke={7} from={F.hex} to="#2563eb" label={pendingFeedback.evaluation.overall} sub="/ 10" />
                  <div className="max-w-md">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{pendingFeedback.oneLineFeedback || 'Answer recorded.'}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {Object.entries(pendingFeedback.evaluation).filter(([k]) => k !== 'overall').slice(0, 7).map(([k, v]) => (
                        <Badge key={k} className="bg-white/80 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">{interviewer.prettyDim(k)} {v}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Btn size="lg" grad={F.btnGrad} loading={busy || (pendingFeedback.nextQuestion === '' && busy)} onClick={handleNext}>
                  {pendingFeedback.nextQuestion ? (<>Next question <ArrowRight size={16} /></>) : (busy ? 'Building your report…' : 'Finish & view report')}
                </Btn>
              </div>
              {(pendingFeedback.strengths.length > 0 || pendingFeedback.weaknesses.length > 0) && (
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <FbList title="Strengths" icon={CheckCircle2} cls="text-emerald-500" items={pendingFeedback.strengths} />
                  <FbList title="Improve" icon={AlertCircle} cls="text-amber-500" items={pendingFeedback.improvements.length ? pendingFeedback.improvements : pendingFeedback.weaknesses} />
                  <FbList title="Revise topics" icon={BookOpen} cls="text-blue-500" items={pendingFeedback.topicsToRevise} />
                </div>
              )}
              {pendingFeedback.betterAnswer && (
                <details className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-4 text-sm dark:border-slate-700/60 dark:bg-slate-800/40">
                  <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-200"><Lightbulb size={14} className="mr-1.5 inline text-amber-500" />Model answer</summary>
                  <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">{pendingFeedback.betterAnswer}</p>
                </details>
              )}
            </Card>
          </motion.div>
        ) : (
          !busy && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="sticky bottom-20 mt-5 lg:bottom-6">
              <Card className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <button
                    onClick={toggleMic}
                    disabled={!sr.supported}
                    aria-label={sr.listening ? 'Stop recording' : 'Start recording'}
                    className={`relative grid h-12 w-12 shrink-0 place-items-center rounded-full text-white shadow-lg transition-all ${sr.listening ? `bg-gradient-to-br ${F.grad} animate-pulsering` : sr.supported ? 'bg-gradient-to-br from-slate-600 to-slate-500 hover:scale-105' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    {sr.listening ? <MicOff size={19} /> : <Mic size={19} />}
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
                      rows={3}
                      placeholder={sr.listening ? 'Listening… speak your answer' : sr.supported ? 'Type your answer, or tap the mic to speak it…' : 'Type your answer… (speech not supported in this browser)'}
                      className={`${inputCls} resize-none`}
                      aria-label="Your answer"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-slate-400">
                        {sr.error || (sr.listening ? `${answer.trim().split(/\s+/).filter(Boolean).length} words captured` : 'Ctrl+Enter to submit')}
                      </p>
                      {!sr.supported && <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400">Voice unavailable — typing mode</Badge>}
                    </div>
                  </div>
                  <Btn grad={F.btnGrad} icon={Send} onClick={handleSubmit} disabled={!answer.trim()} loading={busy} className="h-12 px-5">
                    Send
                  </Btn>
                </div>
              </Card>
            </motion.div>
          )
        )}

        <Modal open={confirmLeave} onClose={() => setConfirmLeave(false)} title="End this interview?">
          <p className="text-sm text-slate-500 dark:text-slate-400">Progress so far ({transcript.length} answered) will be discarded — nothing is saved until the interview completes.</p>
          <div className="mt-6 flex justify-end gap-3">
            <Btn variant="ghost" onClick={() => setConfirmLeave(false)}>Keep going</Btn>
            <Btn variant="danger" onClick={() => { setConfirmLeave(false); setPhase('setup'); setTranscript([]); stopSpeaking(); if (sr.listening) sr.stop(); }}>Discard & exit</Btn>
          </div>
        </Modal>
      </Container>
    </Page>
  );
}

function useAppToggle() { /* stops speech; full toggle lives in Settings */
  stopSpeaking();
}

function ChatBubble({ who, children, active }) {
  const isAI = who === 'ai';
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`flex max-w-[85%] items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}>
        {isAI && (
          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${F.grad} text-white shadow ${active ? 'animate-pulse' : ''}`}>
            <Mic size={14} />
          </span>
        )}
        <div className={`rounded-2xl px-4.5 py-3 px-4 text-sm leading-relaxed ${
          isAI
            ? `rounded-tl-sm bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/80 dark:bg-slate-800/90 dark:text-slate-200 dark:ring-slate-700/60 ${active ? 'ring-2 ring-cyan-400/50' : ''}`
            : 'rounded-tr-sm bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow'
        }`}>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function FbList({ title, icon: Icon, cls, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${cls}`}><Icon size={13} /> {title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((x) => <li key={x} className="text-sm text-slate-600 dark:text-slate-300">· {x}</li>)}
      </ul>
    </div>
  );
}

function FeedbackInline({ fb, index, latest }) {
  const [open, setOpen] = useState(latest);
  return (
    <div className="ml-12">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-300">
        <Badge className={fb.evaluation.overall >= 7 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}>
          {fb.evaluation.overall}/10
        </Badge>
        {fb.oneLineFeedback}
        {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-2 max-w-2xl rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-400">
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(fb.evaluation).filter(([k]) => k !== 'overall').slice(0, 7).map(([k, v]) => (
                  <span key={k} className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold dark:bg-slate-700/60">{interviewer.prettyDim(k)} {v}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
