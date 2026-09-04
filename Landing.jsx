import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight, Mic, MicOff, FileText, ScanLine, CheckCircle2, XCircle, Sparkles,
  Trophy, Flame, Brain, TerminalSquare, LineChart, ShieldCheck, Zap, Layers, ChevronRight,
  Upload, Volume2, CircleCheck, BarChart3,
} from 'lucide-react';
import { Logo, BtnLink, Btn, SectionHead, Card, Badge, Ring } from '../components/ui';
import { Footer } from '../components/layout';
import { FEATURES, FEATURE_LIST, TAGLINE, SUBLINE } from '../constants';
import { APTITUDE_QUESTIONS } from '../data/content';
import { useApp } from '../context/AppContext';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

export default function Landing() {
  const { user } = useApp();
  const startTo = user ? '/dashboard' : '/auth?mode=register';
  return (
    <div className="bg-[#080b12]">
      <Hero startTo={startTo} />
      <Ticker />
      <Features />
      <InterviewShowcase startTo={startTo} />
      <ResumeShowcase startTo={startTo} />
      <CodingShowcase startTo={startTo} />
      <AptitudeShowcase startTo={startTo} />
      <CommShowcase startTo={startTo} />
      <HowItWorks />
      <AnalyticsPreview startTo={startTo} />
      <AchievementsStrip />
      <WhyUs />
      <FinalCTA startTo={startTo} />
      <Footer />
    </div>
  );
}

/* ============================= HERO ============================= */
function Hero({ startTo }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const floatCards = [
    { f: FEATURES.interview, pos: 'left-[2%] top-[16%]', delay: 0, label: 'Adaptive Q&A' },
    { f: FEATURES.resume, pos: 'left-[6%] bottom-[12%]', delay: 1.2, label: 'ATS scoring' },
    { f: FEATURES.coding, pos: 'right-[3%] top-[14%]', delay: 0.6, label: 'Real execution' },
    { f: FEATURES.aptitude, pos: 'right-[8%] bottom-[16%]', delay: 1.8, label: 'Timed tests' },
    { f: FEATURES.communication, pos: 'right-[26%] top-[4%]', delay: 2.4, label: 'Speech coach' },
  ];
  return (
    <section ref={ref} className="mesh-dark noise relative overflow-hidden pb-24 pt-32 sm:pt-36">
      <div className="grid-lines absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div style={{ y: yHero }} className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Badge className="border border-white/15 bg-white/5 px-4 py-1.5 text-[12px] font-semibold text-slate-200 backdrop-blur">
              <Sparkles size={13} className="text-cyan-300" />
              One platform for complete interview preparation
            </Badge>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 font-display text-[2.6rem] font-bold leading-[1.06] text-white sm:text-6xl lg:text-7xl"
          >
            {TAGLINE[0]}{' '}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">{TAGLINE[1]}</span>
            <br />
            <span className="bg-gradient-to-r from-pink-400 via-orange-300 to-yellow-300 bg-clip-text text-transparent">{TAGLINE[2]}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg"
          >
            {SUBLINE}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <BtnLink to={startTo} size="lg" grad="from-blue-600 to-cyan-500" className="shadow-blue-600/30 shadow-xl">
              Start Preparing <ArrowRight size={17} />
            </BtnLink>
            <a
              href="#features"
              onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/15 px-7 py-3.5 text-base font-semibold text-slate-200 transition-all hover:border-white/30 hover:bg-white/5"
            >
              Explore InterviewHub
            </a>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-5 text-xs text-slate-500">
            Free MVP · runs on your own AI key · your data stays in your browser
          </motion.p>
        </motion.div>

        {/* Floating feature chips around the product preview */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          {floatCards.map((c) => (
            <motion.div
              key={c.f.key}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + c.delay * 0.2, duration: 0.5 }}
              className={`absolute z-10 hidden xl:block ${c.pos}`}
            >
              <div className="animate-floaty rounded-2xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-xl" style={{ animationDelay: `${c.delay}s` }}>
                <div className="flex items-center gap-2.5">
                  <span className={`grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br ${c.f.grad} text-white shadow-lg`}>
                    <c.f.icon size={17} />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-white">{c.f.short}</p>
                    <p className="text-[10px] text-slate-400">{c.label}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Central product preview — an honest look at the interview screen */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45 }}
            className="relative rounded-3xl border border-white/10 bg-slate-900/70 p-2 shadow-2xl shadow-blue-950/40 backdrop-blur-xl"
          >
            <div className="flex items-center gap-1.5 px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              <span className="ml-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">InterviewHub · AI Interview · product preview</span>
            </div>
            <div className="grid gap-3 rounded-2xl bg-[#0b1120] p-4 sm:grid-cols-[1.5fr_1fr] sm:p-5">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400">
                    <Mic size={14} className="text-white" />
                  </span>
                  <div className="rounded-2xl rounded-tl-sm bg-slate-800/90 px-4 py-2.5 text-sm text-slate-200">
                    Tell me about a challenging project you built. What made it hard?
                  </div>
                </div>
                <div className="flex items-start justify-end gap-3">
                  <div className="rounded-2xl rounded-tr-sm bg-gradient-to-r from-blue-600/80 to-cyan-600/70 px-4 py-2.5 text-sm text-white">
                    I built a hospital management system in Java — the tricky part was concurrent appointment booking…
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400">
                    <Mic size={14} className="text-white" />
                  </span>
                  <div className="rounded-2xl rounded-tl-sm bg-slate-800/90 px-4 py-2.5 text-sm text-slate-200">
                    Good. How did you prevent double bookings from two simultaneous requests?
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3">
                  <span className="relative grid h-8 w-8 place-items-center rounded-full bg-cyan-500/20 text-cyan-300">
                    <span className="absolute inset-0 rounded-full animate-pulsering" />
                    <Mic size={14} />
                  </span>
                  <span className="flex h-6 items-end gap-[3px]" aria-hidden="true">
                    {[0.5, 0.9, 0.3, 0.7, 1, 0.4, 0.8, 0.6, 0.9, 0.35, 0.75, 0.5].map((d, i) => (
                      <span key={i} className="eq-bar w-[3px] rounded-full bg-gradient-to-t from-blue-500 to-cyan-300" style={{ height: '100%', animationDelay: `${i * 0.08}s` }} />
                    ))}
                  </span>
                  <span className="text-xs font-medium text-cyan-300">Listening… speak your answer</span>
                </div>
              </div>
              <div className="hidden flex-col justify-between gap-3 sm:flex">
                <div className="rounded-xl border border-white/10 bg-slate-800/50 p-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live feedback</p>
                  <div className="mt-2.5 space-y-2">
                    {[['Technical', 82, 'from-blue-500 to-cyan-400'], ['Communication', 74, 'from-pink-500 to-rose-400'], ['Confidence', 68, 'from-amber-400 to-orange-400']].map(([l, v, g]) => (
                      <div key={l}>
                        <div className="mb-1 flex justify-between text-[10px] font-semibold text-slate-400"><span>{l}</span><span className="text-slate-300">{v}/100</span></div>
                        <div className="h-1.5 rounded-full bg-white/10"><motion.div initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ delay: 1, duration: 1 }} className={`h-full rounded-full bg-gradient-to-r ${g}`} /></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[[FileText, 'Resume ATS', 'from-orange-500 to-rose-400'], [TerminalSquare, 'Code runs real', 'from-emerald-500 to-cyan-400']].map(([Icon, l, g]) => (
                    <div key={l} className="rounded-xl border border-white/10 bg-slate-800/50 p-3">
                      <span className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${g}`}><Icon size={14} className="text-white" /></span>
                      <p className="mt-1.5 text-[11px] font-semibold leading-tight text-slate-300">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ============================= TICKER ============================= */
function Ticker() {
  const items = ['AI Voice Interviews', 'Adaptive Questions', 'ATS Resume Scoring', 'Real Code Execution', 'Timed Aptitude Tests', 'Speech Coaching', 'Skill Analytics', 'Achievement Streaks'];
  const colors = ['text-cyan-300', 'text-blue-300', 'text-orange-300', 'text-emerald-300', 'text-yellow-300', 'text-pink-300', 'text-indigo-300', 'text-rose-300'];
  return (
    <div className="overflow-hidden border-y border-white/5 bg-[#0a0f1a] py-4">
      <motion.div
        className="flex w-max items-center gap-10 whitespace-nowrap"
        animate={{ x: [0, -900] }}
        transition={{ repeat: Infinity, duration: 26, ease: 'linear' }}
      >
        {[...items, ...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-3 text-sm font-semibold text-slate-400">
            <span className={`h-1.5 w-1.5 rounded-full ${colors[i % colors.length].replace('text-', 'bg-')}`} />
            <span className={colors[i % colors.length]}>{t}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ============================= FEATURES ============================= */
function Features() {
  return (
    <section id="features" className="mesh-light relative bg-[#f8fafc] py-24 dark:bg-[#080b12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          eyebrow="Everything you need"
          title={<>Six tools. <span className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">One preparation hub.</span></>}
          sub="Every module below is genuinely functional — real AI, real execution, real speech, real parsing. No theaters, no demos pretending to work."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_LIST.map((f, i) => (
            <motion.div key={f.key} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
              <Link to={f.path}>
                <Card hover className={`group relative h-full overflow-hidden p-6 ${f.soft.replace('dark:', '')}`}>
                  <div className={`pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br ${f.grad} opacity-[0.13] blur-2xl transition-opacity group-hover:opacity-25`} />
                  <div className="flex items-center justify-between">
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${f.grad} text-white shadow-lg ${f.glowShadow}`}>
                      <f.icon size={22} />
                    </span>
                    <ChevronRight size={18} className="text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-slate-500" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-slate-900 dark:text-white">{f.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{f.desc}</p>
                  <span className={`mt-4 inline-flex items-center gap-1 text-xs font-bold ${f.text}`}>Open module <ArrowRight size={12} /></span>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== SHOWCASE LAYOUT HELPER ==================== */
function Showcase({ id, dark, children }) {
  return (
    <section id={id} className={`relative overflow-hidden py-24 ${dark ? 'mesh-dark' : 'bg-[#f8fafc] dark:bg-[#080b12]'}`}>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </section>
  );
}

/* ==================== AI INTERVIEW ==================== */
function InterviewShowcase({ startTo }) {
  const f = FEATURES.interview;
  const points = ['Questions adapt to every answer — strong answers raise the bar', 'Speak or type: real microphone input with live transcription', 'Per-answer scoring across 8 dimensions with a better-answer model'];
  return (
    <Showcase dark id="interview-sec">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div {...fadeUp}>
          <Badge className="border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1 text-xs text-cyan-300"><f.icon size={12} /> {f.name}</Badge>
          <h2 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">
            An interviewer that <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">actually interviews you</span>
          </h2>
          <p className="mt-4 leading-relaxed text-slate-400">
            Iris — your AI interviewer — runs HR, technical, behavioral, system-design and mixed interviews. Mention a project, and she digs into it. Struggle, and she adapts. Every evaluation is generated from your actual answer.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-slate-300">
                <CircleCheck size={18} className="mt-0.5 shrink-0 text-cyan-400" /> {p}
              </li>
            ))}
          </ul>
          <BtnLink to={startTo === '/' ? startTo : '/interview'} size="lg" grad="from-blue-600 to-cyan-500" className="mt-8">
            Try AI Interview <ArrowRight size={17} />
          </BtnLink>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white"><Mic size={17} /></span>
                <div>
                  <p className="text-sm font-bold text-white">Iris · Technical Interview</p>
                  <p className="text-xs text-cyan-300">Frontend Developer · Adaptive</p>
                </div>
              </div>
              <Badge className="bg-cyan-400/10 text-cyan-300">Question 4 of 10</Badge>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-slate-800/90 p-4 text-sm text-slate-200">
                You mentioned React — how does the reconciliation algorithm decide what to re-render?
              </div>
              <div className="ml-8 rounded-2xl bg-gradient-to-r from-blue-600/70 to-cyan-600/60 p-4 text-sm text-white">
                It diffs the virtual DOM tree against the previous one and commits only the changed nodes…
              </div>
              <div className="grid grid-cols-4 gap-2 pt-1">
                {[['Tech', 8], ['Comm', 7], ['Conf', 7], ['Acc', 9]].map(([l, v]) => (
                  <div key={l} className="rounded-xl border border-white/10 bg-slate-800/60 p-2.5 text-center">
                    <p className={`font-display text-lg font-bold ${v >= 8 ? 'text-emerald-400' : 'text-amber-400'}`}>{v}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Showcase>
  );
}

/* ==================== RESUME ==================== */
function ResumeShowcase({ startTo }) {
  const f = FEATURES.resume;
  return (
    <Showcase id="resume-sec">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div {...fadeUp} className="order-2 lg:order-1">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-orange-500/5 dark:border-slate-700/60 dark:bg-slate-900/80">
            <div className="flex items-center gap-4 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/60 p-5 dark:border-orange-500/30 dark:bg-orange-500/5">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-rose-400 text-white"><Upload size={20} /></span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Drop your resume — PDF or DOCX</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Your file is parsed in the browser. It never leaves your device.</p>
              </div>
            </div>
            <div className="mt-5 flex items-center gap-6">
              <Ring value={82} size={120} from="#f97316" to="#fb7185" label="82" sub="ATS score" />
              <div className="flex-1 space-y-2.5">
                {[['Contact info complete', true], ['Quantified achievements', true], ['7 missing role keywords', false], ['Add a professional summary', false]].map(([l, ok]) => (
                  <div key={l} className="flex items-center gap-2.5 text-sm">
                    {ok ? <CheckCircle2 size={16} className="text-emerald-500" /> : <XCircle size={16} className="text-rose-400" />}
                    <span className="text-slate-600 dark:text-slate-300">{l}</span>
                  </div>
                ))}
                <p className="pt-1 text-[11px] text-slate-400">Illustrative — your analysis is computed from your real file.</p>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="order-1 lg:order-2">
          <Badge className={`${f.soft} px-3.5 py-1 text-xs ${f.text}`}><f.icon size={12} /> {f.name}</Badge>
          <h2 className="mt-5 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            See your resume <span className="bg-gradient-to-r from-orange-500 to-rose-400 bg-clip-text text-transparent">the way an ATS does</span>
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Real text extraction from PDF and DOCX, keyword gap analysis against your target role, and a transparent scoring rubric — plus deep AI feedback when your key is configured.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {['Drag & drop upload', 'Section & skill extraction', 'Keyword gap vs target role', 'Version history tracking'].map((t) => (
              <div key={t} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300">
                <ScanLine size={14} className="text-orange-500" /> {t}
              </div>
            ))}
          </div>
          <BtnLink to="/resume" size="lg" grad="from-orange-500 to-rose-500" className="mt-8 shadow-orange-500/25">
            Analyze My Resume <ArrowRight size={17} />
          </BtnLink>
        </motion.div>
      </div>
    </Showcase>
  );
}

/* ==================== CODING ==================== */
function CodingShowcase({ startTo }) {
  const f = FEATURES.coding;
  return (
    <Showcase dark id="coding-sec">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div {...fadeUp}>
          <Badge className="border border-emerald-400/30 bg-emerald-400/10 px-3.5 py-1 text-xs text-emerald-300"><f.icon size={12} /> {f.name}</Badge>
          <h2 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">
            A coding arena with <span className="bg-gradient-to-r from-emerald-400 to-cyan-300 bg-clip-text text-transparent">real execution</span>
          </h2>
          <p className="mt-4 leading-relaxed text-slate-400">
            A proper editor with syntax highlighting, multiple languages and sandboxed execution — JavaScript runs instantly in the browser; Python and Java run through the Judge0 sandbox when configured. Optional AI code review grades correctness, readability and complexity.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['JavaScript', 'Python', 'Java', 'C++', 'Test-case verdicts', 'Runtime analytics'].map((t) => (
              <Badge key={t} className="border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">{t}</Badge>
            ))}
          </div>
          <BtnLink to="/coding" size="lg" grad="from-emerald-600 to-teal-500" className="mt-8">
            Enter Coding Arena <ArrowRight size={17} />
          </BtnLink>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d1424] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500">two-sum.js</span>
              <Badge className="bg-emerald-400/10 text-emerald-300">4/4 passed</Badge>
            </div>
            <pre className="p-5 font-mono text-[13px] leading-6 text-slate-300">
              <code>
                <span className="text-pink-400">function</span> <span className="text-cyan-300">twoSum</span>(nums, target) {'{'}{'\n'}
                {'  '}<span className="text-pink-400">const</span> seen = <span className="text-pink-400">new</span> <span className="text-cyan-300">Map</span>();{'\n'}
                {'  '}<span className="text-pink-400">for</span> (<span className="text-pink-400">let</span> i = <span className="text-amber-300">0</span>; i {'<'} nums.length; i++) {'{'}{'\n'}
                {'    '}<span className="text-pink-400">const</span> need = target - nums[i];{'\n'}
                {'    '}<span className="text-pink-400">if</span> (seen.<span className="text-cyan-300">has</span>(need)) <span className="text-pink-400">return</span> [seen.<span className="text-cyan-300">get</span>(need), i];{'\n'}
                {'    '}seen.<span className="text-cyan-300">set</span>(nums[i], i);{'\n'}
                {'  }'}{'\n'}
                {'}'}
              </code>
            </pre>
            <div className="flex items-center gap-2 border-t border-white/10 bg-emerald-400/5 px-4 py-3 text-xs text-emerald-300">
              <CheckCircle2 size={15} /> Accepted · 4/4 test cases · O(n) time, O(n) space
            </div>
          </div>
        </motion.div>
      </div>
    </Showcase>
  );
}

/* ==================== APTITUDE (REAL INTERACTIVE) ==================== */
function AptitudeShowcase({ startTo }) {
  const f = FEATURES.aptitude;
  const q = useMemo(() => APTITUDE_QUESTIONS.find((x) => x.id === 3), []);
  const [picked, setPicked] = useState(null);
  return (
    <Showcase id="aptitude-sec">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div {...fadeUp} className="order-2 lg:order-1">
          <Card className="border-amber-200/80 p-6 dark:border-amber-500/20">
            <div className="flex items-center justify-between">
              <Badge className={`${f.soft} ${f.text}`}>Live demo · Quantitative</Badge>
              <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400">{q.diff}</Badge>
            </div>
            <p className="mt-4 font-semibold leading-relaxed text-slate-900 dark:text-white">{q.q}</p>
            <div className="mt-4 grid gap-2">
              {q.options.map((opt, i) => {
                const state = picked === null ? 'idle' : i === q.answer ? 'correct' : i === picked ? 'wrong' : 'idle';
                return (
                  <button
                    key={opt}
                    onClick={() => setPicked(i)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all ${
                      state === 'correct' ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : state === 'wrong' ? 'border-rose-300 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300'
                      : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/60 dark:border-slate-700 dark:hover:bg-slate-800/70 dark:text-slate-200'
                    }`}
                  >
                    {opt}
                    {state === 'correct' && <CheckCircle2 size={16} />}
                    {state === 'wrong' && <XCircle size={16} />}
                  </button>
                );
              })}
            </div>
            {picked !== null && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900 dark:bg-amber-500/10 dark:text-amber-200">
                <span className="font-bold">{picked === q.answer ? 'Correct. ' : `Not quite — the answer is "${q.options[q.answer]}". `}</span>
                {q.expl}
              </motion.div>
            )}
          </Card>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="order-1 lg:order-2">
          <Badge className={`${f.soft} px-3.5 py-1 text-xs ${f.text}`}><f.icon size={12} /> {f.name}</Badge>
          <h2 className="mt-5 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Real questions. <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Real explanations.</span>
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600 dark:text-slate-400">
            Timed tests across quantitative, logical, verbal, data interpretation and core CS subjects (OS, DBMS, networks, OOP) — with per-topic accuracy analytics. Try the demo: it's a real question with real grading.
          </p>
          <BtnLink to="/aptitude" size="lg" grad="from-amber-500 to-orange-500" className="mt-8 shadow-amber-500/25">
            Start Aptitude Tests <ArrowRight size={17} />
          </BtnLink>
        </motion.div>
      </div>
    </Showcase>
  );
}

/* ==================== COMMUNICATION (REAL MIC DEMO) ==================== */
function CommShowcase({ startTo }) {
  const f = FEATURES.communication;
  const supported = typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [metrics, setMetrics] = useState(null);
  const recRef = useRef(null);
  const startRef = useRef(0);

  const stop = () => {
    try { recRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  };

  const startDemo = () => {
    if (listening) { stop(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = true;
    recRef.current = rec;
    setTranscript(''); setMetrics(null);
    startRef.current = Date.now();
    let finalText = '';
    rec.onresult = (e) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
        else interim += e.results[i][0].transcript;
      }
      setTranscript(finalText + interim);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      const secs = Math.max(1, (Date.now() - startRef.current) / 1000);
      const words = finalText.trim().split(/\s+/).filter(Boolean);
      if (words.length >= 3) {
        const fillers = (finalText.toLowerCase().match(/\b(um|uh|like|you know|basically|actually|literally)\b/g) || []).length;
        setMetrics({ wpm: Math.round((words.length / secs) * 60), fillers, words: words.length });
      }
    };
    try { rec.start(); setListening(true); } catch { setListening(false); }
  };

  useEffect(() => () => { try { recRef.current?.stop(); } catch { /* noop */ } }, []);

  return (
    <Showcase dark id="comm-sec">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <motion.div {...fadeUp}>
          <Badge className="border border-pink-400/30 bg-pink-400/10 px-3.5 py-1 text-xs text-pink-300"><f.icon size={12} /> {f.name}</Badge>
          <h2 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">
            Train how you <span className="bg-gradient-to-r from-pink-400 to-rose-300 bg-clip-text text-transparent">actually sound</span>
          </h2>
          <p className="mt-4 leading-relaxed text-slate-400">
            Speak real answers; the coach transcribes them live and evaluates clarity, structure, filler words, pace and professionalism. {supported ? 'Your browser supports live speech — try the demo on the right.' : 'Your browser lacks the Web Speech API — the coach works with typed answers as a fallback.'}
          </p>
          <BtnLink to="/communication" size="lg" grad="from-pink-600 to-rose-500" className="mt-8">
            Practice Speaking <ArrowRight size={17} />
          </BtnLink>
        </motion.div>
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
          <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-white">Live demo — answer aloud:</p>
              <Badge className="bg-pink-400/10 text-pink-300">"Tell me about yourself"</Badge>
            </div>
            <button
              onClick={startDemo}
              disabled={!supported}
              className={`mt-5 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-6 transition-all ${
                listening ? 'animate-pulsering border-pink-400/60 bg-pink-500/10 text-pink-300' : 'border-white/15 text-slate-300 hover:border-pink-400/40 hover:bg-pink-500/5'
              } ${!supported ? 'cursor-not-allowed opacity-50' : ''}`}
            >
              {listening ? <MicOff size={20} /> : <Mic size={20} />}
              <span className="text-sm font-semibold">{!supported ? 'Speech recognition not supported here' : listening ? 'Listening… tap to stop' : 'Tap and speak (browser mic)'}</span>
            </button>
            <div className="mt-4 min-h-[64px] rounded-xl bg-slate-800/70 p-4 text-sm leading-relaxed text-slate-300">
              {transcript || <span className="text-slate-500">Your transcript will appear here in real time…</span>}
            </div>
            {metrics && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 grid grid-cols-3 gap-2">
                {[['Pace', `${metrics.wpm} wpm`], ['Fillers', metrics.fillers], ['Words', metrics.words]].map(([l, v]) => (
                  <div key={l} className="rounded-xl border border-white/10 bg-slate-800/60 p-3 text-center">
                    <p className="font-display text-lg font-bold text-pink-300">{v}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{l}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </Showcase>
  );
}

/* ==================== HOW IT WORKS ==================== */
function HowItWorks() {
  const steps = [
    { n: '01', title: 'Create your profile', desc: 'Sign up locally, set your target role and plug in your AI key (or use a preconfigured one).', grad: 'from-blue-500 to-cyan-400' },
    { n: '02', title: 'Pick a module', desc: 'Interview, resume, coding, aptitude or communication — each fully interactive.', grad: 'from-pink-500 to-rose-400' },
    { n: '03', title: 'Practice for real', desc: 'Real questions, real execution, real speech — scored from your actual performance.', grad: 'from-amber-400 to-orange-400' },
    { n: '04', title: 'Track & improve', desc: 'Analytics, streaks, achievements and recommendations computed from your activity.', grad: 'from-emerald-500 to-teal-400' },
  ];
  return (
    <section id="how" className="bg-[#f8fafc] py-24 dark:bg-[#080b12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead eyebrow="How it works" title="From zero to interview-ready" sub="Four steps. No setup marathon — the whole platform runs in your browser." />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div key={s.n} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <Card hover className="relative h-full overflow-hidden p-6">
                <span className={`font-display text-5xl font-bold bg-gradient-to-br ${s.grad} bg-clip-text text-transparent opacity-90`}>{s.n}</span>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{s.desc}</p>
                <div className={`mt-5 h-1 w-12 rounded-full bg-gradient-to-r ${s.grad}`} />
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== ANALYTICS PREVIEW ==================== */
function AnalyticsPreview({ startTo }) {
  return (
    <section id="analytics" className="mesh-dark relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div {...fadeUp}>
            <Badge className="border border-indigo-400/30 bg-indigo-400/10 px-3.5 py-1 text-xs text-indigo-300"><BarChart3 size={12} /> Performance Analytics</Badge>
            <h2 className="mt-5 font-display text-3xl font-bold text-white sm:text-4xl">
              Analytics with <span className="bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">zero invented numbers</span>
            </h2>
            <p className="mt-4 leading-relaxed text-slate-400">
              Every chart on your dashboard is computed from your interviews, submissions, tests and speaking sessions. Haven't practiced yet? You'll see honest empty states — not fake stats. This panel is a product preview; yours starts blank and fills with real progress.
            </p>
            <BtnLink to={startTo === '/' ? startTo : '/analytics'} size="lg" grad="from-indigo-600 to-blue-500" className="mt-8">
              View My Analytics <ArrowRight size={17} />
            </BtnLink>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }}>
            <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-white">Skill radar · product preview</p>
                <Badge className="bg-indigo-400/10 text-indigo-300">Live on your data</Badge>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto]">
                <PreviewBars />
                <div className="flex items-center justify-center">
                  <Ring value={76} size={130} from="#6366f1" to="#06b6d4" label="76" sub="readiness" />
                </div>
              </div>
              <p className="mt-3 text-[11px] text-slate-500">Illustrative preview — your dashboard only charts your real activity.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function PreviewBars() {
  const bars = [
    { l: 'Technical', v: 74, g: 'from-blue-500 to-cyan-400' },
    { l: 'Coding', v: 68, g: 'from-emerald-500 to-teal-400' },
    { l: 'Communication', v: 71, g: 'from-pink-500 to-rose-400' },
    { l: 'Aptitude', v: 80, g: 'from-amber-400 to-orange-400' },
    { l: 'Resume', v: 65, g: 'from-orange-500 to-rose-400' },
  ];
  return (
    <div className="space-y-3.5">
      {bars.map((b, i) => (
        <div key={b.l}>
          <div className="mb-1 flex justify-between text-xs"><span className="font-medium text-slate-400">{b.l}</span><span className="font-bold text-slate-300">{b.v}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div initial={{ width: 0 }} whileInView={{ width: `${b.v}%` }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.1 }} className={`h-full rounded-full bg-gradient-to-r ${b.g}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ==================== ACHIEVEMENTS ==================== */
function AchievementsStrip() {
  const badges = ['First Interview', '7 Day Streak', 'Coding Hero', 'Resume Ready', 'Aptitude Master', 'Communication Pro', 'Interview Champion', 'Full Stack Prep'];
  return (
    <section className="bg-[#f8fafc] py-20 dark:bg-[#080b12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
          <motion.div {...fadeUp}>
            <Badge className="bg-yellow-400/15 px-3.5 py-1 text-xs text-yellow-600 dark:text-yellow-400"><Trophy size={12} /> Gamified progress</Badge>
            <h2 className="mt-4 font-display text-3xl font-bold text-slate-900 dark:text-white">Earned, never given</h2>
            <p className="mt-3 leading-relaxed text-slate-600 dark:text-slate-400">Badges unlock the moment your real activity hits a milestone. Streaks track consecutive practice days — miss a day and it resets, honestly.</p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="flex flex-wrap gap-2.5">
            {badges.map((b, i) => (
              <span key={b} className="inline-flex items-center gap-2 rounded-full border border-yellow-300/60 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-2 text-xs font-bold text-yellow-700 shadow-sm dark:border-yellow-500/25 dark:from-yellow-500/10 dark:to-orange-500/10 dark:text-yellow-300" style={{ transform: `rotate(${(i % 3) - 1}deg)` }}>
                <Trophy size={13} /> {b}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ==================== WHY ==================== */
function WhyUs() {
  const items = [
    { icon: ShieldCheck, grad: 'from-blue-500 to-cyan-400', t: 'Private by design', d: 'No servers, no accounts database. Your data lives in your browser; export or wipe it any time.' },
    { icon: Zap, grad: 'from-pink-500 to-rose-400', t: 'Real, not theater', d: 'Real LLM feedback, real code execution, real speech recognition, real file parsing. If a service is missing, we tell you.' },
    { icon: Layers, grad: 'from-emerald-500 to-teal-400', t: 'One complete stack', d: 'Interviews, ATS resume checks, coding, aptitude, communication and analytics under one consistent design system.' },
    { icon: LineChart, grad: 'from-indigo-500 to-purple-400', t: 'Adaptive & measured', d: 'Difficulty adapts to your answers; every session feeds honest analytics and personalized recommendations.' },
  ];
  return (
    <section className="bg-[#f8fafc] pb-24 dark:bg-[#080b12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead eyebrow="Why InterviewHub" title="Built like the process is real — because it is" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((i, k) => (
            <motion.div key={i.t} {...fadeUp} transition={{ ...fadeUp.transition, delay: k * 0.07 }}>
              <Card hover className="h-full p-6">
                <span className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br ${i.grad} text-white shadow-lg`}><i.icon size={20} /></span>
                <h3 className="mt-4 font-display text-base font-bold text-slate-900 dark:text-white">{i.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{i.d}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==================== FINAL CTA ==================== */
function FinalCTA({ startTo }) {
  return (
    <section className="bg-[#f8fafc] pb-24 dark:bg-[#080b12]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] p-10 text-center sm:p-16" style={{ background: 'linear-gradient(120deg,#1e3a8a 0%,#2563eb 30%,#06b6d4 55%,#10b981 80%,#f59e0b 120%)' }}>
          <div className="noise absolute inset-0" />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold text-white sm:text-5xl">Your offer letter starts with tonight's practice.</h2>
            <p className="mx-auto mt-4 max-w-xl text-white/80">Set up in two minutes. Practice for real. Track everything.</p>
            <BtnLink to={startTo} size="xl" variant="dark" className="mt-8 bg-white !text-slate-900 shadow-2xl hover:bg-slate-100">
              Start Preparing — It's Free <Flame size={18} className="text-orange-500" />
            </BtnLink>
            <div className="mx-auto mt-8 flex max-w-lg flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-white/70">
              <span className="flex items-center gap-1.5"><Brain size={13} /> AI-powered</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={13} /> Privacy-first</span>
              <span className="flex items-center gap-1.5"><Volume2 size={13} /> Voice-native</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
