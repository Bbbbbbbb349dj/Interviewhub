import React, { useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Send, RotateCcw, Copy, Check, Maximize2, Minimize2, Clock, CheckCircle2,
  XCircle, Lightbulb, Sparkles, Terminal, AlertTriangle, ChevronRight, BrainCircuit, Timer,
} from 'lucide-react';
import { Page, Container, FeatureHeader } from '../components/layout';
import { Card, Btn, Badge, ErrorState, ScoreBar, Modal, btnClasses } from '../components/ui';
import { FEATURES, DIFF_COLOR } from '../constants';
import { CODING_PROBLEMS } from '../data/content';
import { LANGUAGES, runCode, judge0Configured } from '../services/executionService';
import { aiConfigured, askJSON, friendlyAIError } from '../services/aiService';
import { storage, KEYS, uid, fmtDuration } from '../services/storage';
import { useApp } from '../context/AppContext';

const F = FEATURES.coding;
const langExt = { javascript: () => javascript(), python: () => python(), java: () => java(), cpp: () => cpp(), c: () => cpp() };

export default function Coding() {
  const { commitActivity, toast } = useApp();
  const [problem, setProblem] = useState(CODING_PROBLEMS[0]);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(CODING_PROBLEMS[0].starter.javascript);
  const [tab, setTab] = useState('desc');
  const [running, setRunning] = useState(false);
  const [verdict, setVerdict] = useState(null); // {results, compileError, runtimeError, runtime, submitted}
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [aiReview, setAiReview] = useState(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const startedRef = useRef(Date.now());

  useEffect(() => {
    const t = setInterval(() => setElapsed((Date.now() - startedRef.current) / 1000), 1000);
    return () => clearInterval(t);
  }, []);

  const pick = (p) => {
    setProblem(p);
    setCode(p.starter[language] || p.starter.javascript);
    setVerdict(null); setError(null); setAiReview(null);
    startedRef.current = Date.now();
  };

  const switchLang = (l) => {
    setLanguage(l);
    setCode(problem.starter[l] || problem.starter.javascript);
    setVerdict(null); setError(null);
  };

  async function execute(submitted) {
    if (running) return;
    setRunning(true); setError(null); setVerdict(null);
    try {
      const out = await runCode(problem, language, code);
      out.submitted = submitted;
      setVerdict(out);
      if (submitted && out.results.length) {
        const passed = out.results.filter((r) => r.passed).length;
        storage.push(KEYS.coding, {
          id: uid(), problemId: problem.id, title: problem.title, language,
          passed, total: out.results.length, runtime: out.runtime, ts: Date.now(),
        });
        commitActivity('coding', `${problem.title} — ${passed}/${out.results.length} tests (${language})`);
        if (passed === out.results.length) toast('success', 'Accepted', `All ${out.results.length} test cases passed for ${problem.title}.`);
      }
    } catch (e) {
      const msg = String(e.message || e);
      if (msg.startsWith('JUDGE0_NOT_CONFIGURED:')) setError(new Error(msg.replace('JUDGE0_NOT_CONFIGURED:', '')));
      else setError(new Error(msg));
    } finally {
      setRunning(false);
    }
  }

  async function reviewWithAI() {
    setReviewBusy(true); setReviewError(null);
    try {
      const data = await askJSON(
        'You are a principal engineer doing a rigorous code review. Respond only with valid JSON.',
        `Review this ${language} solution for the problem "${problem.title}".\nProblem: ${problem.statement}\n\nCODE:\n\`\`\`\n${code}\n\`\`\`\n\nReturn JSON: {"score":0-10,"summary":"2-3 sentences","strengths":["..."],"weaknesses":["..."],"optimizations":["concrete optimization ideas"],"bestPractices":["naming/readability issues, if any"],"timeComplexity":"O(...)","spaceComplexity":"O(...)","alternativeApproach":"one paragraph describing a different approach"}`,
      );
      setAiReview(data);
    } catch (e) {
      setReviewError(friendlyAIError(e));
    } finally {
      setReviewBusy(false);
    }
  }

  const copyCode = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { setCopied(false); }
  };

  const visibleTests = useMemo(() => verdict?.results || problem.tests.map((t, i) => ({ index: i, args: t.args, expected: JSON.stringify(t.expected) })), [verdict, problem]);

  return (
    <Page>
      <Container className="max-w-[1400px] pt-6">
        <FeatureHeader feature="coding" />
        <div className={`mt-5 grid gap-4 ${fullscreen ? '' : 'lg:grid-cols-[280px_1fr]'}`}>
          {/* Problem list */}
          {!fullscreen && (
            <Card className="h-max p-3">
              <p className="px-2 pb-2 text-xs font-bold uppercase tracking-widest text-slate-400">Problems</p>
              <div className="space-y-1">
                {CODING_PROBLEMS.map((p) => {
                  const solved = (storage.get(KEYS.coding, []) || []).some((a) => a.problemId === p.id && a.passed === a.total && a.total > 0);
                  return (
                    <button
                      key={p.id}
                      onClick={() => pick(p)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${problem.id === p.id ? 'bg-emerald-500/10 ring-1 ring-emerald-500/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
                    >
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold ${solved ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                        {solved ? <Check size={14} /> : p.title[0]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{p.title}</span>
                        <span className={`text-[11px] font-semibold ${DIFF_COLOR[p.diff].split(' ')[0]}`}>{p.diff}</span>
                      </span>
                      <ChevronRight size={14} className="text-slate-300" />
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 rounded-xl bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                {judge0Configured()
                  ? 'Judge0 configured — Python & Java run in a real sandbox.'
                  : 'JavaScript runs instantly in the browser. Configure VITE_JUDGE0_API_URL for Python/Java sandboxed execution.'}
              </div>
            </Card>
          )}

          {/* Main area */}
          <div className={`grid gap-4 ${fullscreen ? 'grid-rows-[auto_auto_1fr_auto]' : 'xl:grid-cols-[1fr_1.25fr]'}`}>
            {/* Statement */}
            {!fullscreen && (
              <Card className="flex max-h-[calc(100vh-220px)] flex-col overflow-hidden">
                <div className="border-b border-slate-100 p-4 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">{problem.title}</h2>
                    <Badge className={DIFF_COLOR[problem.diff]}>{problem.diff}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {problem.tags.map((t) => <Badge key={t} className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{t}</Badge>)}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-slate-50 p-1 dark:bg-slate-800/60">
                    {[['desc', 'Problem'], ['hints', 'Hints'], ['complexity', 'Complexity']].map(([k, l]) => (
                      <button key={k} onClick={() => setTab(k)} className={`rounded-md py-1.5 text-xs font-bold transition-colors ${tab === k ? 'bg-white text-emerald-600 shadow dark:bg-slate-900 dark:text-emerald-400' : 'text-slate-500'}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 text-sm">
                  {tab === 'desc' && (
                    <div className="space-y-4 leading-relaxed text-slate-600 dark:text-slate-300">
                      <p>{problem.statement}</p>
                      <div>
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Signature</p>
                        <code className={`rounded-lg px-2.5 py-1.5 font-mono text-xs ${F.soft} ${F.text}`}>{problem.sig}</code>
                      </div>
                      <div>
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">Constraints</p>
                        <ul className="list-disc space-y-1 pl-5">{problem.constraints.map((c) => <li key={c}>{c}</li>)}</ul>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Examples</p>
                        {problem.examples.map((ex, i) => (
                          <div key={i} className="rounded-xl bg-slate-50 p-3 font-mono text-xs dark:bg-slate-800/60">
                            <p><span className="font-sans font-bold text-slate-400">Input: </span>{ex.input}</p>
                            <p><span className="font-sans font-bold text-slate-400">Output: </span>{ex.output}</p>
                            {ex.note && <p className="mt-1 font-sans text-slate-400">{ex.note}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {tab === 'hints' && (
                    <ul className="space-y-3">
                      {problem.hints.map((h, i) => (
                        <li key={i} className="flex items-start gap-2.5 rounded-xl bg-amber-50 p-3 text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                          <Lightbulb size={16} className="mt-0.5 shrink-0" /> <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {tab === 'complexity' && (
                    <div className="grid grid-cols-2 gap-3">
                      {[['Time', problem.complexity.time], ['Space', problem.complexity.space]].map(([l, v]) => (
                        <div key={l} className={`rounded-xl ${F.soft} p-4 text-center`}>
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Expected {l}</p>
                          <p className={`mt-1 font-mono font-bold ${F.text}`}>{v}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Editor + results */}
            <div className="flex flex-col gap-4">
              <Card className="overflow-hidden !border-slate-700/60 !bg-[#0d1424]">
                <div className="flex flex-wrap items-center gap-2 border-b border-white/10 bg-[#0a0f1c] px-3 py-2">
                  <Terminal size={15} className="text-emerald-400" />
                  <select
                    value={language}
                    onChange={(e) => switchLang(e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#111a2e] px-2.5 py-1.5 text-xs font-semibold text-slate-200 focus:outline-none"
                    aria-label="Language"
                  >
                    {LANGUAGES.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                  </select>
                  <span className="ml-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400"><Timer size={13} /> {fmtDuration(elapsed)}</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <IconBtn title="Copy" onClick={copyCode}>{copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}</IconBtn>
                    <IconBtn title="Reset" onClick={() => switchLang(language)}><RotateCcw size={14} /></IconBtn>
                    <IconBtn title="Fullscreen" onClick={() => setFullscreen(!fullscreen)}>{fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</IconBtn>
                  </div>
                </div>
                <CodeMirror
                  value={code}
                  height={fullscreen ? '52vh' : '340px'}
                  theme={oneDark}
                  extensions={[langExt[language] ? langExt[language]() : javascript()]}
                  onChange={setCode}
                  basicSetup={{ lineNumbers: true, foldGutter: true, autocompletion: true, highlightActiveLine: true }}
                  aria-label="Code editor"
                />
                <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-[#0a0f1c] px-3 py-2.5">
                  <Btn size="sm" grad="from-slate-600 to-slate-500" icon={Play} onClick={() => execute(false)} loading={running && !verdict?.submitted} disabled={running}>Run</Btn>
                  <Btn size="sm" grad={F.btnGrad} icon={Send} onClick={() => execute(true)} loading={running} disabled={running}>Submit</Btn>
                  <span className="text-[11px] text-slate-500">Run = preview tests · Submit = all tests, saved to your stats</span>
                  {aiConfigured() && (
                    <Btn size="sm" variant="outline" icon={BrainCircuit} className="ml-auto !border-slate-600 !text-slate-300 hover:!bg-slate-800" onClick={reviewWithAI} loading={reviewBusy}>AI Review</Btn>
                  )}
                </div>
              </Card>

              {/* Results */}
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Test results</p>
                  {verdict && !verdict.compileError && !verdict.runtimeError && (
                    <VerdictBadge verdict={verdict} />
                  )}
                </div>
                {error && <div className="p-4"><ErrorState title="Execution failed" message={error.message} /></div>}
                {verdict?.compileError && (
                  <div className="p-4">
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10">
                      <p className="flex items-center gap-2 text-sm font-bold text-rose-600 dark:text-rose-300"><AlertTriangle size={15} /> Compilation / Syntax error</p>
                      <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-rose-600/90 dark:text-rose-300/80">{verdict.compileError}</pre>
                    </div>
                  </div>
                )}
                {verdict?.runtimeError && (
                  <div className="p-4">
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10">
                      <p className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300"><AlertTriangle size={15} /> Runtime issue</p>
                      <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-amber-700/90 dark:text-amber-300/80">{verdict.runtimeError}</pre>
                    </div>
                  </div>
                )}
                <div className="max-h-72 overflow-y-auto p-3">
                  {running ? (
                    <div className="space-y-2">
                      {problem.tests.map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
                      <p className="px-2 pt-1 text-xs text-slate-400">Executing real code — {language === 'javascript' ? 'in your browser runtime…' : 'in the Judge0 sandbox…'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {visibleTests.map((t) => (
                        <motion.div
                          key={t.index}
                          initial={verdict ? { opacity: 0, x: -8 } : false} animate={{ opacity: 1, x: 0 }} transition={{ delay: t.index * 0.07 }}
                          className={`rounded-xl border p-3 text-xs ${verdict ? (t.passed ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/5' : 'border-rose-200 bg-rose-50/60 dark:border-rose-500/25 dark:bg-rose-500/5') : 'border-slate-200 dark:border-slate-700/60'}`}
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-700 dark:text-slate-200">Test {t.index + 1}</p>
                            {verdict && (t.passed
                              ? <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={14} /> Passed{t.ms != null ? ` · ${t.ms < 1 ? '<1' : Math.round(t.ms)}ms` : ''}</span>
                              : <span className="flex items-center gap-1 font-bold text-rose-500"><XCircle size={14} /> Failed</span>)}
                          </div>
                          <p className="mt-1.5 font-mono text-slate-500 dark:text-slate-400">Input: {JSON.stringify(t.args)}</p>
                          <p className="mt-0.5 font-mono text-slate-500 dark:text-slate-400">Expected: {t.expected}</p>
                          {verdict && !t.passed && <p className="mt-0.5 font-mono font-bold text-rose-500">Got: {t.got}</p>}
                        </motion.div>
                      ))}
                      {verdict && <p className="px-1 pt-1 text-[11px] font-semibold text-slate-400"><Clock size={11} className="mr-1 inline" />{verdict.runtime}</p>}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* AI Review modal */}
        <Modal open={Boolean(aiReview || reviewError) || reviewBusy} onClose={() => { setAiReview(null); setReviewError(null); }} title="AI Code Review" wide>
          {reviewBusy ? (
            <div className="space-y-3">{[80, 60, 90, 45].map((w, i) => <div key={i} className="skeleton h-4 rounded" style={{ width: `${w}%` }} />)}</div>
          ) : reviewError ? (
            <ErrorState title="Review failed" message={reviewError} onRetry={reviewWithAI} />
          ) : aiReview ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className={`grid h-14 w-14 place-items-center rounded-2xl font-display text-xl font-bold text-white ${aiReview.score >= 7 ? 'bg-gradient-to-br from-emerald-500 to-teal-400' : aiReview.score >= 5 ? 'bg-gradient-to-br from-amber-400 to-orange-400' : 'bg-gradient-to-br from-rose-500 to-orange-400'}`}>{aiReview.score}</div>
                <p className="flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{aiReview.summary}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <ReviewList title="Strengths" items={aiReview.strengths} cls="bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200" />
                <ReviewList title="Issues" items={aiReview.weaknesses} cls="bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-200" />
                <ReviewList title="Optimizations" items={aiReview.optimizations} cls="bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-200" />
                <ReviewList title="Best practices" items={aiReview.bestPractices} cls="bg-purple-50 text-purple-800 dark:bg-purple-500/10 dark:text-purple-200" />
              </div>
              <div className="flex gap-4 text-sm">
                <Badge className="bg-emerald-500/10 px-3 py-1.5 text-emerald-600 dark:text-emerald-400">Time: {aiReview.timeComplexity}</Badge>
                <Badge className="bg-cyan-500/10 px-3 py-1.5 text-cyan-600 dark:text-cyan-400">Space: {aiReview.spaceComplexity}</Badge>
              </div>
              {aiReview.alternativeApproach && (
                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
                  <p className="mb-1 flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100"><Sparkles size={14} className="text-emerald-500" /> Alternative approach</p>
                  {aiReview.alternativeApproach}
                </div>
              )}
            </div>
          ) : null}
        </Modal>
      </Container>
    </Page>
  );
}

function IconBtn({ children, onClick, title }) {
  return (
    <button onClick={onClick} title={title} aria-label={title} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-slate-200">
      {children}
    </button>
  );
}

function VerdictBadge({ verdict }) {
  const passed = verdict.results.filter((r) => r.passed).length;
  const total = verdict.results.length;
  const accepted = passed === total && total > 0;
  return (
    <Badge className={accepted ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500'}>
      {accepted ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {accepted ? `Accepted · ${passed}/${total}` : `Wrong Answer · ${passed}/${total}`}
    </Badge>
  );
}

function ReviewList({ title, items, cls }) {
  if (!items?.length) return null;
  return (
    <div className={`rounded-xl p-4 ${cls}`}>
      <p className="text-xs font-bold uppercase tracking-wider opacity-80">{title}</p>
      <ul className="mt-2 space-y-1 text-sm">{items.map((x) => <li key={x}>· {x}</li>)}</ul>
    </div>
  );
}
