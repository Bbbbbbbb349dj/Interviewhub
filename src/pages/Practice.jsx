import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Page, Container, FeatureHeader } from '../components/layout';
import { Card, Badge } from '../components/ui';
import { FEATURES, FEATURE_LIST, APT_CATEGORIES } from '../constants';

const INTERVIEW_MODES = [
  { label: 'HR Interview', type: 'HR', desc: 'Salary, motivation, culture fit, career goals' },
  { label: 'Behavioral', type: 'Behavioral', desc: 'STAR stories: conflict, teamwork, leadership' },
  { label: 'Technical', type: 'Technical', desc: 'Role-specific deep-dive questions' },
  { label: 'Coding Discussion', type: 'Coding Discussion', desc: 'Talk through approaches and trade-offs' },
  { label: 'System Design', type: 'System Design', desc: 'Architecture, scale, and design decisions' },
  { label: 'Mixed', type: 'Mixed', desc: 'A bit of everything — full simulation' },
];

export default function Practice() {
  const F = FEATURES.practice;
  return (
    <Page>
      <Container className="space-y-10 pt-8">
        <FeatureHeader feature="practice" title="Practice Hub" desc="Every mode of interview preparation, one launchpad. Pick a lane — or mix them." />

        {/* Core modules */}
        <section>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Core training</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_LIST.filter((f) => f.key !== 'analytics').map((f, i) => (
              <motion.div key={f.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={f.path}>
                  <Card hover className={`h-full p-5 ${f.soft}`}>
                    <span className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${f.grad} text-white shadow-md`}><f.icon size={19} /></span>
                    <p className="mt-3 font-display text-base font-bold text-slate-900 dark:text-white">{f.name}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
                    <span className={`mt-3 inline-flex items-center gap-1 text-xs font-bold ${f.text}`}>Start <ArrowRight size={12} /></span>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Interview modes */}
        <section>
          <div className="flex items-center gap-3">
            <span className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${FEATURES.interview.grad} text-white`}><FEATURES.interview.icon size={16} /></span>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Interview modes</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {INTERVIEW_MODES.map((m) => (
              <Link key={m.type} to={`/interview?type=${encodeURIComponent(m.type)}`}>
                <Card hover className="h-full p-4">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{m.label}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{m.desc}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CS subject MCQs */}
        <section className="pb-4">
          <div className="flex items-center gap-3">
            <span className={`grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br ${FEATURES.aptitude.grad} text-white`}><FEATURES.aptitude.icon size={16} /></span>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">Subject tests & MCQs</h2>
            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400">Real questions, real scoring</Badge>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {APT_CATEGORIES.map((c, i) => (
              <Link key={c.key} to={`/aptitude?cat=${c.key}`}>
                <Card hover className="h-full p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{c.name}</p>
                    <span className={`h-2 w-2 rounded-full ${['bg-amber-400', 'bg-yellow-400', 'bg-orange-400', 'bg-rose-400', 'bg-blue-400', 'bg-emerald-400', 'bg-cyan-400', 'bg-pink-400'][i % 8]}`} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Timed test with explanations</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </Page>
  );
}
