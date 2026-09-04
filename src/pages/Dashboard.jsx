import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame, ArrowRight, Sparkles, Trophy, Lock, Clock, ChevronRight, Target, User,
} from 'lucide-react';
import { Page, Container } from '../components/layout';
import { Card, Badge, Ring, EmptyState, BtnLink, ProgressBar, ScoreBar } from '../components/ui';
import { FEATURES, FEATURE_LIST } from '../constants';
import { ACHIEVEMENTS } from '../services/gamification';
import { useApp } from '../context/AppContext';
import { fmtDateTime, fmtDuration } from '../services/storage';

const ACTIVITY_META = {
  interview: { f: FEATURES.interview, label: 'Interview' },
  coding: { f: FEATURES.coding, label: 'Coding' },
  aptitude: { f: FEATURES.aptitude, label: 'Aptitude' },
  communication: { f: FEATURES.communication, label: 'Speaking' },
  resume: { f: FEATURES.resume, label: 'Resume' },
  account: { f: { ...FEATURES.analytics, icon: User, grad: 'from-slate-500 to-slate-400' }, label: 'Account' },
};

export default function Dashboard() {
  const { user, stats, achievements } = useApp();
  const firstName = (user?.name || 'there').split(' ')[0];
  const unlocked = new Set(achievements.map((a) => a.id));

  const statCards = [
    { f: FEATURES.interview, label: 'Interviews', value: stats.interviews.count, sub: stats.interviews.avgScore != null ? `${stats.interviews.avgScore}/10 avg` : 'no scored sessions', to: '/interview' },
    { f: FEATURES.coding, label: 'Coding accuracy', value: stats.coding.accuracy != null ? `${stats.coding.accuracy}%` : '—', sub: `${stats.coding.total} submission${stats.coding.total === 1 ? '' : 's'}`, to: '/coding' },
    { f: FEATURES.aptitude, label: 'Aptitude accuracy', value: stats.aptitude.accuracy != null ? `${stats.aptitude.accuracy}%` : '—', sub: `${stats.aptitude.total} questions`, to: '/aptitude' },
    { f: FEATURES.communication, label: 'Speaking score', value: stats.comm.avg != null ? `${stats.comm.avg}/10` : '—', sub: `${stats.comm.count} session${stats.comm.count === 1 ? '' : 's'}`, to: '/communication' },
    { f: FEATURES.resume, label: 'Resume score', value: stats.resume.latest ? stats.resume.latest.analysis.score : '—', sub: stats.resume.latest ? stats.resume.latest.targetRole : 'not analyzed', to: '/resume' },
  ];

  const signals = [
    stats.interviews.avgScore != null && { label: 'Interviews', value: stats.interviews.avgScore * 10, to: '/interview', f: FEATURES.interview },
    stats.coding.accuracy != null && { label: 'Coding', value: stats.coding.accuracy, to: '/coding', f: FEATURES.coding },
    stats.aptitude.accuracy != null && { label: 'Aptitude', value: stats.aptitude.accuracy, to: '/aptitude', f: FEATURES.aptitude },
    stats.comm.avg != null && { label: 'Speaking', value: stats.comm.avg * 10, to: '/communication', f: FEATURES.communication },
    stats.resume.latest && { label: 'Resume', value: stats.resume.latest.analysis.score, to: '/resume', f: FEATURES.resume },
  ].filter(Boolean).sort((a, b) => a.value - b.value);
  const recommendations = signals.slice(0, 2);

  return (
    <Page>
      <Container className="pt-8">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-400">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Hello, <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">{firstName}</span>
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {user?.profile?.targetRole ? <>Targeting <span className="font-semibold text-slate-700 dark:text-slate-200">{user.profile.targetRole}</span></> : 'Set your target role in Profile to personalize practice.'}
            </p>
          </div>
          <Badge className="border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-2 text-sm text-orange-600 dark:border-orange-500/25 dark:from-orange-500/10 dark:to-amber-500/10 dark:text-orange-300">
            <Flame size={15} /> {stats.streak} day{stats.streak === 1 ? '' : 's'} streak
          </Badge>
        </div>

        {!stats.hasAnyData ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <Card className="relative overflow-hidden p-8 sm:p-10">
              <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-blue-500 via-cyan-400 to-pink-500 opacity-15 blur-3xl" />
              <div className="relative max-w-2xl">
                <Badge className="bg-cyan-500/10 px-3 py-1 text-xs text-cyan-600 dark:text-cyan-400"><Sparkles size={12} /> Let's begin</Badge>
                <h2 className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">No interviews completed yet — and that's exactly where everyone starts.</h2>
                <p className="mt-3 leading-relaxed text-slate-500 dark:text-slate-400">
                  Start your first AI interview to begin tracking your progress. Every stat on this dashboard is computed from your real activity — finish a session and watch it come alive.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <BtnLink to="/interview" grad={FEATURES.interview.btnGrad}>Start AI Interview <ArrowRight size={16} /></BtnLink>
                  <BtnLink to="/resume" variant="outline">Analyze my resume</BtnLink>
                </div>
              </div>
            </Card>
          </motion.div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statCards.map((s, i) => (
              <Link key={s.label} to={s.to}>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card hover className={`h-full p-5 ${s.f.soft}`}>
                    <div className="flex items-center justify-between">
                      <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${s.f.grad} text-white shadow-md`}><s.f.icon size={18} /></span>
                      <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="mt-4 font-display text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{s.sub}</p>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Quick actions */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Practice now</h3>
                <Link to="/practice" className="text-xs font-bold text-teal-600 hover:underline dark:text-teal-400">Open Practice Hub</Link>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {FEATURE_LIST.map((f) => (
                  <Link key={f.key} to={f.path} className={`group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/70 ${f.soft}`}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${f.grad} text-white shadow`}><f.icon size={17} /></span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{f.short}</p>
                      <p className={`text-[11px] font-semibold ${f.text}`}>Open <ArrowRight size={10} className="inline" /></p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Recent activity */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Recent activity</h3>
                <Link to="/history" className="text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400">View history</Link>
              </div>
              {stats.activity.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">Nothing yet — your completed sessions will appear here.</p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.activity.slice(0, 8).map((a, i) => {
                    const meta = ACTIVITY_META[a.kind] || ACTIVITY_META.account;
                    return (
                      <li key={i} className="flex items-center gap-3 py-3">
                        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${meta.f.grad} text-white`}><meta.f.icon size={15} /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{a.label}</p>
                          <p className="text-xs text-slate-400">{meta.label} · {fmtDateTime(a.ts)}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            {/* Achievements */}
            <Card className="p-6" id="achievements">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-slate-900 dark:text-white"><Trophy size={18} className="text-yellow-500" /> Achievements</h3>
                <Badge className="bg-yellow-400/10 text-yellow-600 dark:text-yellow-400">{unlocked.size}/{ACHIEVEMENTS.length} unlocked</Badge>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {ACHIEVEMENTS.map((a) => {
                  const has = unlocked.has(a.id);
                  return (
                    <div key={a.id} className={`flex items-center gap-3 rounded-xl border p-3 ${has ? 'border-yellow-300/70 bg-gradient-to-r from-yellow-50 to-orange-50 dark:border-yellow-500/25 dark:from-yellow-500/10 dark:to-orange-500/5' : 'border-slate-200 opacity-50 dark:border-slate-700/60'}`}>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${has ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-md shadow-yellow-500/30' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                        {has ? <Trophy size={15} /> : <Lock size={14} />}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{a.title}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{has ? 'Unlocked' : a.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <Card className="p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Interview readiness</p>
              {stats.readiness != null ? (
                <>
                  <div className="mt-4 flex justify-center">
                    <Ring value={stats.readiness} size={150} from="#6366f1" to="#06b6d4" label={`${stats.readiness}`} sub="/ 100" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {stats.readiness >= 75 ? 'Strong — keep the momentum.' : stats.readiness >= 50 ? 'Solid base — targeted practice will lift this.' : 'Early stage — consistency is everything.'}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Computed from {signals.length} real signal{signals.length === 1 ? '' : 's'}</p>
                </>
              ) : (
                <EmptyState
                  icon={Target}
                  title="No data yet"
                  desc="Your readiness score appears after your first real practice session."
                  accent="from-indigo-500 to-blue-400"
                  action={<BtnLink to="/interview" size="sm" grad="from-indigo-600 to-blue-500">First interview</BtnLink>}
                />
              )}
            </Card>

            {stats.interviews.dimAvg.technicalKnowledge != null && (
              <Card className="p-6">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Interview skill breakdown</h3>
                <div className="mt-5 space-y-4">
                  {[
                    ['Technical knowledge', stats.interviews.dimAvg.technicalKnowledge, '#06b6d4'],
                    ['Communication', stats.interviews.dimAvg.communication, '#ec4899'],
                    ['Confidence', stats.interviews.dimAvg.confidence, '#f59e0b'],
                    ['Problem solving', stats.interviews.dimAvg.problemSolving, '#10b981'],
                  ].filter(([, v]) => v != null).map(([l, v], i) => (
                    <ScoreBar key={l} label={l} value={v} max={10} delay={i * 0.08} />
                  ))}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Recommended practice</h3>
              {recommendations.length ? (
                <div className="mt-4 space-y-3">
                  {recommendations.map((r) => (
                    <Link key={r.label} to={r.to} className={`flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/70 ${r.f.soft}`}>
                      <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${r.f.grad} text-white`}><r.f.icon size={17} /></span>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Improve {r.label}</p>
                        <div className="mt-1.5"><ProgressBar value={r.value} grad={r.f.grad} /></div>
                      </div>
                      <span className="font-display text-sm font-bold text-slate-500">{Math.round(r.value)}%</span>
                    </Link>
                  ))}
                  <p className="text-xs text-slate-400">Your two weakest real signals — work on these next.</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Complete any session and we'll pinpoint what to practice next.</p>
              )}
            </Card>

            {stats.resume.latest && (
              <Card className={`p-5 ${FEATURES.resume.soft}`}>
                <div className="flex items-center gap-4">
                  <Ring value={stats.resume.latest.analysis.score} size={76} stroke={7} from="#f97316" to="#fb7185" label={stats.resume.latest.analysis.score} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Latest resume</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{stats.resume.latest.fileName}</p>
                    <Link to="/resume" className={`mt-1 inline-block text-xs font-bold ${FEATURES.resume.text}`}>{stats.resume.versions.length > 1 ? `${stats.resume.versions.length} versions · ` : ''}Improve it →</Link>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-5">
              <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <Clock size={16} className="text-slate-400" />
                <span>{stats.interviews.count > 0 ? `Last interview: ${fmtDateTime(stats.interviews.interviews[stats.interviews.interviews.length - 1]?.endedAt)} (${fmtDuration(stats.interviews.interviews[stats.interviews.interviews.length - 1]?.durationSec || 0)})` : 'No interviews on record yet.'}</span>
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </Page>
  );
}
