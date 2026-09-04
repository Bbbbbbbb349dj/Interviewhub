import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Flame, BarChart2, ArrowRight } from 'lucide-react';
import { Page, Container, FeatureHeader } from '../components/layout';
import { Card, Badge, Ring, EmptyState, BtnLink, ProgressBar } from '../components/ui';
import { LineChart, RadarChart, BarChart, Donut } from '../components/charts';
import { FEATURES, APT_CATEGORIES } from '../constants';
import { useApp } from '../context/AppContext';

const catName = (key) => APT_CATEGORIES.find((c) => c.key === key)?.name || key;

export default function Analytics() {
  const { stats } = useApp();

  const radarData = stats.radar.filter((r) => r.value != null);
  const hasRadar = radarData.length >= 3;
  const aptTopics = Object.entries(stats.aptitude.perTopic);
  const langs = Object.entries(stats.coding.languages);

  return (
    <Page>
      <Container className="space-y-6 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1"><FeatureHeader feature="analytics" /></div>
        </div>

        {!stats.hasAnyData ? (
          <EmptyState
            icon={BarChart2}
            accent="from-indigo-500 to-blue-400"
            title="No analytics yet — every chart here is computed from real activity"
            desc="Complete an interview, submit code, or finish an aptitude test and this page will fill with genuine insights. We never show invented statistics."
            action={<BtnLink to="/interview" grad="from-indigo-600 to-blue-500">Start your first session <ArrowRight size={15} /></BtnLink>}
          />
        ) : (
          <>
            {/* Top metrics */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <Card className="col-span-full flex flex-wrap items-center justify-center gap-8 p-6 sm:justify-between lg:col-span-2">
                <div className="text-center sm:text-left">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Readiness</p>
                  <p className="mt-1 max-w-[180px] text-xs text-slate-400">Weighted from {stats.radar.filter((r) => r.value != null).length} real signals</p>
                  <Badge className="mt-2 border border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-300"><Flame size={12} /> {stats.streak}d streak</Badge>
                </div>
                <Ring value={stats.readiness ?? 0} size={130} from="#6366f1" to="#06b6d4" label={stats.readiness ?? '—'} sub="/ 100" />
              </Card>
              {[
                { f: FEATURES.interview, l: 'Avg interview', v: stats.interviews.avgScore != null ? `${stats.interviews.avgScore}/10` : '—', p: stats.interviews.avgScore != null ? stats.interviews.avgScore * 10 : 0 },
                { f: FEATURES.coding, l: 'Coding accuracy', v: stats.coding.accuracy != null ? `${stats.coding.accuracy}%` : '—', p: stats.coding.accuracy ?? 0 },
                { f: FEATURES.aptitude, l: 'Aptitude accuracy', v: stats.aptitude.accuracy != null ? `${stats.aptitude.accuracy}%` : '—', p: stats.aptitude.accuracy ?? 0 },
                { f: FEATURES.communication, l: 'Speaking score', v: stats.comm.avg != null ? `${stats.comm.avg}/10` : '—', p: stats.comm.avg != null ? stats.comm.avg * 10 : 0 },
              ].map((m, i) => (
                <motion.div key={m.l} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="h-full p-5">
                    <span className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${m.f.grad} text-white`}><m.f.icon size={16} /></span>
                    <p className="mt-3 font-display text-2xl font-bold text-slate-900 dark:text-white">{m.v}</p>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{m.l}</p>
                    <ProgressBar value={m.p} grad={m.f.grad} className="mt-3" />
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Interview trend */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Interview score trend</h3>
                  <Badge className={FEATURES.interview.soft + ' ' + FEATURES.interview.text}>{stats.interviews.count} sessions</Badge>
                </div>
                {stats.trend.length ? (
                  <div className="mt-4 h-64"><LineChart labels={stats.trend.map((t) => t.label)} data={stats.trend.map((t) => t.score)} color="#06b6d4" label="Score" /></div>
                ) : (
                  <EmptyState icon={FEATURES.interview.icon} accent={FEATURES.interview.grad} title="No interviews on record" desc="Finish an AI interview and your score timeline appears here." action={<BtnLink to="/interview" size="sm" grad={FEATURES.interview.btnGrad}>Take an interview</BtnLink>} />
                )}
              </Card>

              {/* Skill radar */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Skill radar</h3>
                  <Badge className={FEATURES.analytics.soft + ' ' + FEATURES.analytics.text}>{radarData.length}/6 signals live</Badge>
                </div>
                {hasRadar ? (
                  <div className="mt-4 h-64"><RadarChart labels={stats.radar.map((r) => r.label)} data={stats.radar.map((r) => r.value ?? 0)} /></div>
                ) : (
                  <EmptyState icon={FEATURES.analytics.icon} accent={FEATURES.analytics.grad} title="Need 3+ activity signals" desc={`${radarData.length} of 6 dimensions have real data. Train across more modules to complete the radar.`} />
                )}
              </Card>

              {/* Aptitude by topic */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Aptitude by topic</h3>
                  <Badge className={FEATURES.aptitude.soft + ' ' + FEATURES.aptitude.text}>{stats.aptitude.total} questions answered</Badge>
                </div>
                {aptTopics.length ? (
                  <div className="mt-4 h-64">
                    <BarChart
                      labels={aptTopics.map(([k]) => catName(k))}
                      data={aptTopics.map(([, v]) => Math.round((v.correct / v.total) * 100))}
                      colors={aptTopics.map((_, i) => ['#f59e0b', '#f97316', '#eab308', '#fb7185', '#06b6d4', '#10b981', '#6366f1', '#ec4899'][i % 8])}
                    />
                  </div>
                ) : (
                  <EmptyState icon={FEATURES.aptitude.icon} accent={FEATURES.aptitude.grad} title="No aptitude attempts" desc="Take a timed test to see topic-level accuracy." action={<BtnLink to="/aptitude" size="sm" grad={FEATURES.aptitude.btnGrad}>Take a test</BtnLink>} />
                )}
              </Card>

              {/* Coding languages */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Coding languages</h3>
                  <Badge className={FEATURES.coding.soft + ' ' + FEATURES.coding.text}>{stats.coding.total} submissions · {stats.coding.solved} solved</Badge>
                </div>
                {langs.length ? (
                  <div className="mt-4 h-64">
                    <Donut labels={langs.map(([k]) => k)} data={langs.map(([, v]) => v)} colors={['#10b981', '#06b6d4', '#f59e0b', '#6366f1', '#ec4899', '#f97316']} />
                  </div>
                ) : (
                  <EmptyState icon={FEATURES.coding.icon} accent={FEATURES.coding.grad} title="No code submissions" desc="Your first Run or Submit in the arena starts this chart." action={<BtnLink to="/coding" size="sm" grad={FEATURES.coding.btnGrad}>Open arena</BtnLink>} />
                )}
              </Card>
            </div>

            {/* Communication detail */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Communication history</h3>
                <Badge className={FEATURES.communication.soft + ' ' + FEATURES.communication.text}>{stats.comm.count} sessions</Badge>
              </div>
              {stats.comm.sessions.length ? (
                <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {[...stats.comm.sessions].reverse().slice(0, 6).map((s) => (
                    <li key={s.id} className="flex items-center gap-4 py-3 text-sm">
                      <Badge className={s.scores.overall >= 7 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-pink-500/10 text-pink-600 dark:text-pink-400'}>{s.scores.overall}/10</Badge>
                      <span className="min-w-0 flex-1 truncate font-medium text-slate-700 dark:text-slate-200">{s.prompt}</span>
                      <span className="text-xs text-slate-400">{s.metrics?.wpm} wpm · {s.metrics?.fillers} fillers · {s.mode === 'ai' ? 'AI' : 'local'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState icon={FEATURES.communication.icon} accent={FEATURES.communication.grad} title="No speaking sessions" desc="Speak one answer out loud with the coach and your metrics show up here." action={<BtnLink to="/communication" size="sm" grad={FEATURES.communication.btnGrad}>Practice speaking</BtnLink>} />
              )}
            </Card>

            <p className="text-center text-xs text-slate-400">
              All figures computed live from your LocalStorage activity — nothing sampled, nothing invented. Clear your data in <Link className="font-semibold text-indigo-500 hover:underline" to="/settings">Settings</Link> to reset.
            </p>
          </>
        )}
      </Container>
    </Page>
  );
}
