import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2, XCircle, RefreshCcw,
  Lightbulb, Target, BookOpenCheck, Timer,
} from 'lucide-react';
import { Page, Container, FeatureHeader } from '../components/layout';
import { Card, Btn, Badge, Field, Select, Ring, ProgressBar, EmptyState } from '../components/ui';
import { FEATURES, APT_CATEGORIES, DIFF_COLOR, DIFFICULTIES } from '../constants';
import { APTITUDE_QUESTIONS } from '../data/content';
import { storage, KEYS, uid, fmtDuration } from '../services/storage';
import { useApp } from '../context/AppContext';

const F = FEATURES.aptitude;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Aptitude() {
  const [params] = useSearchParams();
  const { commitActivity } = useApp();
  const [phase, setPhase] = useState('setup'); // setup | test | results
  const [cfg, setCfg] = useState({ cat: params.get('cat') || 'mixed', diff: 'All', count: '5' });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const pool = useMemo(() => APTITUDE_QUESTIONS.filter(
    (q) => (cfg.cat === 'mixed' || q.cat === cfg.cat) && (cfg.diff === 'All' || q.diff === cfg.diff),
  ), [cfg]);

  function startTest() {
    const count = cfg.count === 'all' ? pool.length : Math.min(+cfg.count, pool.length);
    if (!count) return;
    const qs = shuffle(pool).slice(0, count);
    setQuestions(qs);
    setAnswers({});
    setIdx(0);
    setTimeLeft(qs.length * 60);
    startRef.current = Date.now();
    setPhase('test');
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          submitTest(qs, answersRef.current, true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  const answersRef = useRef(answers);
  answersRef.current = answers;

  function submitTest(qs = questions, ans = answers, auto = false) {
    clearInterval(timerRef.current);
    let correct = 0;
    const perTopic = {};
    qs.forEach((q) => {
      const right = ans[q.id] === q.answer;
      if (right) correct++;
      perTopic[q.cat] = perTopic[q.cat] || { correct: 0, total: 0 };
      perTopic[q.cat].total++;
      if (right) perTopic[q.cat].correct++;
    });
    const record = {
      id: uid(), cat: cfg.cat, diff: cfg.diff, total: qs.length, correct,
      perTopic, durationSec: (Date.now() - startRef.current) / 1000, ts: Date.now(),
      answers: Object.fromEntries(Object.entries(ans)),
    };
    storage.push(KEYS.aptitude, record);
    commitActivity('aptitude', `${cfg.cat === 'mixed' ? 'Mixed' : catName(cfg.cat)} test — ${correct}/${qs.length} correct${auto ? ' (time expired)' : ''}`);
    setResult({ record, qs });
    setPhase('results');
  }

  const catName = (key) => APT_CATEGORIES.find((c) => c.key === key)?.name || key;

  /* ================= SETUP ================= */
  if (phase === 'setup') {
    const attempts = storage.get(KEYS.aptitude, []);
    return (
      <Page>
        <Container className="max-w-4xl space-y-6 pt-8">
          <FeatureHeader feature="aptitude" />
          <Card className="p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Build your test</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Category">
                <Select value={cfg.cat} onChange={(e) => setCfg({ ...cfg, cat: e.target.value })}>
                  <option value="mixed">Mixed — all categories</option>
                  {APT_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Difficulty">
                <div className="grid grid-cols-4 gap-2">
                  {['All', ...DIFFICULTIES.map((d) => d.replace('Beginner', 'Easy').replace('Intermediate', 'Medium').replace('Advanced', 'Hard'))].map((d) => (
                    <button key={d} onClick={() => setCfg({ ...cfg, diff: d })}
                      className={`rounded-xl border px-2 py-2.5 text-sm font-semibold transition-all ${cfg.diff === d ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'}`}>
                      {d}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Number of questions" hint={`${pool.length} questions available in this selection`}>
                <div className="grid grid-cols-4 gap-2">
                  {['5', '10', 'all'].map((n) => (
                    <button key={n} onClick={() => setCfg({ ...cfg, count: n })}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${cfg.count === n ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400'}`}>
                      {n === 'all' ? `All (${pool.length})` : n}
                    </button>
                  ))}
                  <input type="number" min={3} max={pool.length || 20} placeholder="Custom" aria-label="Custom count"
                    onChange={(e) => setCfg({ ...cfg, count: String(Math.max(3, Math.min(pool.length || 20, +e.target.value || 5))) })}
                    className="rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-center text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
              </Field>
              <div className="flex items-end">
                <div className={`w-full rounded-xl ${F.soft} p-4 text-sm`}>
                  <p className="font-bold text-slate-800 dark:text-slate-100">Rules</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">60 seconds per question · navigate freely · every question includes a real explanation · results feed your analytics.</p>
                </div>
              </div>
            </div>
            <Btn size="lg" grad={F.btnGrad} className="mt-8" onClick={startTest} disabled={!pool.length} icon={Timer}>
              Start Test <span className="text-xs font-normal opacity-80">({cfg.count === 'all' ? pool.length : Math.min(+cfg.count || 5, pool.length)} questions)</span>
            </Btn>
          </Card>

          {attempts.length > 0 && (
            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Previous tests</h3>
              <ul className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                {[...attempts].reverse().slice(0, 6).map((a) => (
                  <li key={a.id} className="flex items-center gap-4 py-2.5 text-sm">
                    <Badge className={`${F.soft} ${F.text}`}>{a.cat === 'mixed' ? 'Mixed' : catName(a.cat)}</Badge>
                    <span className={`font-display font-bold ${(a.correct / a.total) >= 0.7 ? 'text-emerald-500' : 'text-amber-500'}`}>{a.correct}/{a.total}</span>
                    <span className="text-xs text-slate-400">{new Date(a.ts).toLocaleDateString()} · {fmtDuration(a.durationSec)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </Container>
      </Page>
    );
  }

  /* ================= RESULTS ================= */
  if (phase === 'results' && result) {
    const { record, qs } = result;
    const pct = Math.round((record.correct / record.total) * 100);
    return (
      <Page>
        <Container className="max-w-4xl space-y-6 pt-8">
          <FeatureHeader feature="aptitude" title="Test complete" desc={`${record.cat === 'mixed' ? 'Mixed' : catName(record.cat)} · ${record.diff} difficulty`} />
          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            <Card className="p-7 text-center">
              <Ring value={pct} size={160} from="#f59e0b" to="#f97316" label={`${pct}%`} sub="accuracy" />
              <p className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">{record.correct}/{record.total} correct</p>
              <p className="text-sm text-slate-400">{fmtDuration(record.durationSec)} total</p>
              <Badge className={`mt-3 px-4 py-1.5 text-xs ${pct >= 70 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : pct >= 40 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-rose-500/10 text-rose-500'}`}>
                {pct >= 70 ? 'Placement-ready pace' : pct >= 40 ? 'Getting there' : 'Foundations first'}
              </Badge>
            </Card>
            <Card className="p-7">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Topic performance <span className="text-sm font-medium text-slate-400">— from this test</span></h3>
              <div className="mt-5 space-y-4">
                {Object.entries(record.perTopic).map(([cat, v]) => {
                  const p = Math.round((v.correct / v.total) * 100);
                  return (
                    <div key={cat}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{catName(cat)}</span>
                        <span className="font-bold text-slate-500">{v.correct}/{v.total} · {p}%</span>
                      </div>
                      <ProgressBar value={p} grad={p >= 70 ? 'from-emerald-500 to-teal-400' : p >= 40 ? 'from-amber-400 to-orange-400' : 'from-rose-500 to-orange-400'} />
                    </div>
                  );
                })}
              </div>
              <Btn grad={F.btnGrad} icon={RefreshCcw} className="mt-6" onClick={() => setPhase('setup')}>New test</Btn>
            </Card>
          </div>

          <Card className="p-7">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Review & explanations</h3>
            <div className="mt-4 space-y-4">
              {qs.map((q, i) => {
                const mine = record.answers[q.id];
                const right = mine === q.answer;
                return (
                  <div key={q.id} className={`rounded-xl border p-4 ${right ? 'border-emerald-200 dark:border-emerald-500/25' : 'border-rose-200 dark:border-rose-500/25'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Q{i + 1}. {q.q}</p>
                      {right ? <CheckCircle2 size={18} className="shrink-0 text-emerald-500" /> : <XCircle size={18} className="shrink-0 text-rose-500" />}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Correct: {q.options[q.answer]}</Badge>
                      {!right && <Badge className="bg-rose-500/10 text-rose-500">You chose: {mine != null ? q.options[mine] : '—'}</Badge>}
                    </div>
                    <p className="mt-2.5 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                      <Lightbulb size={14} className="mt-0.5 shrink-0" /> {q.expl}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        </Container>
      </Page>
    );
  }

  /* ================= TEST ================= */
  const q = questions[idx];
  const answered = Object.keys(answers).length;
  const urgency = timeLeft < 60;
  return (
    <Page>
      <Container className="max-w-4xl space-y-5 pt-8">
        <Card className={`overflow-hidden ${F.soft}`}>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 p-4 sm:p-5">
            <Badge className="bg-white/70 text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">Question {idx + 1} / {questions.length}</Badge>
            <span className={`flex items-center gap-1.5 font-display text-lg font-bold ${urgency ? 'text-rose-500' : 'text-slate-700 dark:text-slate-200'}`}>
              <Clock size={16} className={urgency ? 'animate-pulse' : ''} /> {fmtDuration(timeLeft)}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{answered} answered</span>
            <Btn size="sm" variant="outline" icon={Flag} className="ml-auto" onClick={() => submitTest()}>Submit</Btn>
          </div>
          <div className="h-1 bg-slate-200/70 dark:bg-slate-700/50">
            <motion.div className={`h-full bg-gradient-to-r ${F.grad}`} animate={{ width: `${(answered / questions.length) * 100}%` }} />
          </div>
        </Card>

        <AnimatePresence mode="wait">
          <motion.div key={q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <Card className="p-6 sm:p-8">
              <div className="flex items-center gap-2">
                <Badge className={`${F.soft} ${F.text}`}>{catName(q.cat)}</Badge>
                <Badge className={DIFF_COLOR[q.diff]}>{q.diff}</Badge>
              </div>
              <h2 className="mt-4 font-display text-xl font-bold leading-relaxed text-slate-900 dark:text-white">{q.q}</h2>
              <div className="mt-6 grid gap-2.5">
                {q.options.map((opt, i) => {
                  const sel = answers[q.id] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswers({ ...answers, [q.id]: i })}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                        sel
                          ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500/25 dark:bg-amber-400/10 dark:text-amber-200'
                          : 'border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50/50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${sel ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <Btn variant="outline" icon={ChevronLeft} onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0}>Prev</Btn>
          <div className="hidden flex-wrap justify-center gap-1.5 sm:flex">
            {questions.map((qq, i) => (
              <button
                key={qq.id}
                onClick={() => setIdx(i)}
                aria-label={`Go to question ${i + 1}`}
                className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                  i === idx ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow'
                  : answers[qq.id] !== undefined ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          {idx === questions.length - 1 ? (
            <Btn grad={F.btnGrad} icon={BookOpenCheck} onClick={() => submitTest()}>Submit test</Btn>
          ) : (
            <Btn variant="outline" onClick={() => setIdx(Math.min(questions.length - 1, idx + 1))}>Next <ChevronRight size={15} /></Btn>
          )}
        </div>
      </Container>
    </Page>
  );
}
