import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Eye, History as HistoryIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Page, Container, FeatureHeader } from '../components/layout';
import { Card, Btn, Badge, Select, Input, Ring, ScoreBar, EmptyState, BtnLink, Modal } from '../components/ui';
import { FEATURES, INTERVIEW_TYPES } from '../constants';
import { storage, KEYS, fmtDateTime, fmtDuration } from '../services/storage';
import { prettyDim } from '../services/interviewService';
import { useApp } from '../context/AppContext';

export default function History() {
  const { toast, refreshStats } = useApp();
  const [version, setVersion] = useState(0);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [detail, setDetail] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const interviews = storage.get(KEYS.interviews, []);

  const filtered = useMemo(() => interviews
    .filter((i) => typeFilter === 'All' || i.type === typeFilter)
    .filter((i) => [i.role, i.type, i.difficulty].join(' ').toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.endedAt - a.endedAt), [interviews, query, typeFilter, version]);

  function doDelete(rec) {
    storage.set(KEYS.interviews, interviews.filter((x) => x.id !== rec.id));
    setConfirmDelete(null);
    setDetail(null);
    setVersion((v) => v + 1);
    refreshStats();
    toast('info', 'Interview deleted', 'The record was removed from local storage.');
  }

  return (
    <Page>
      <Container className="space-y-6 pt-8">
        <FeatureHeader feature="analytics" title="Interview History" desc="Every interview you've actually completed — searchable, filterable, yours." />

        <Card className="flex flex-col gap-3 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input className="pl-10" placeholder="Search by role, type, difficulty…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search interviews" />
          </div>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="sm:w-56" aria-label="Filter by type">
            <option>All</option>
            {INTERVIEW_TYPES.map((t) => <option key={t}>{t}</option>)}
          </Select>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            accent="from-indigo-500 to-blue-400"
            title={interviews.length ? 'No interviews match your filters' : 'No interviews completed yet'}
            desc={interviews.length ? 'Try a different search or filter.' : 'Start your first AI interview to begin tracking your progress — every completed session lands here with its full transcript and scoring.'}
            action={!interviews.length && <BtnLink to="/interview" grad={FEATURES.interview.btnGrad}>Start an interview</BtnLink>}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((rec, i) => (
              <motion.div key={rec.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card hover className="flex flex-wrap items-center gap-4 p-4 sm:p-5">
                  <Ring value={(rec.average?.overall ?? 0) * 10} size={64} stroke={6} from={rec.average?.overall >= 7 ? '#10b981' : rec.average?.overall >= 5 ? '#f59e0b' : '#f43f5e'} to="#06b6d4" label={rec.average?.overall ?? '—'} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display font-bold text-slate-900 dark:text-white">{rec.type} Interview</p>
                      <Badge className={FEATURES.interview.soft + ' ' + FEATURES.interview.text}>{rec.role}</Badge>
                      <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">{rec.difficulty}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {fmtDateTime(rec.endedAt)} · {rec.count ?? rec.transcript?.length} questions · {fmtDuration(rec.durationSec)} · {rec.provider || 'AI'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Btn size="sm" variant="outline" icon={Eye} onClick={() => setDetail(rec)}>Details</Btn>
                    <Btn size="sm" variant="ghost" icon={Trash2} className="text-rose-400" onClick={() => setConfirmDelete(rec)}>Delete</Btn>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detail modal */}
        <Modal open={Boolean(detail)} onClose={() => { setDetail(null); setExpanded(null); }} title={detail ? `${detail.type} Interview — ${detail.role}` : ''} wide>
          {detail && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-6 rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/50">
                <Ring value={(detail.average?.overall ?? 0) * 10} size={110} from="#06b6d4" to="#2563eb" label={detail.average?.overall ?? '—'} sub="/ 10" />
                <div className="grid flex-1 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                  {detail.average && ['technicalKnowledge', 'communication', 'confidence', 'accuracy', 'completeness', 'problemSolving'].map((d) => (
                    <ScoreBar key={d} label={prettyDim(d)} value={detail.average[d]} max={10} />
                  ))}
                </div>
              </div>
              {detail.summary?.summary && <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{detail.summary.summary}</p>}
              <div className="grid gap-3 sm:grid-cols-2">
                {detail.summary?.strongAreas?.length > 0 && (
                  <div className="rounded-xl bg-emerald-50 p-4 text-sm dark:bg-emerald-500/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Strong areas</p>
                    <ul className="mt-2 space-y-1 text-emerald-800 dark:text-emerald-200">{detail.summary.strongAreas.map((x) => <li key={x}>· {x}</li>)}</ul>
                  </div>
                )}
                {detail.summary?.weakAreas?.length > 0 && (
                  <div className="rounded-xl bg-rose-50 p-4 text-sm dark:bg-rose-500/10">
                    <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Weak areas</p>
                    <ul className="mt-2 space-y-1 text-rose-800 dark:text-rose-200">{detail.summary.weakAreas.map((x) => <li key={x}>· {x}</li>)}</ul>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Transcript</p>
                {detail.transcript?.map((t, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <button className="flex w-full items-center gap-3 p-3.5 text-left" onClick={() => setExpanded(expanded === i ? null : i)}>
                      <Badge className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 shrink-0">{t.feedback?.evaluation?.overall ?? '—'}/10</Badge>
                      <span className="flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">{t.question}</span>
                      {expanded === i ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                    </button>
                    {expanded === i && (
                      <div className="space-y-2 border-t border-slate-100 p-3.5 text-sm dark:border-slate-800">
                        <p className="text-slate-600 dark:text-slate-300"><b>You:</b> {t.answer}</p>
                        <p className="text-slate-500 dark:text-slate-400"><b>Iris:</b> {t.feedback?.oneLineFeedback}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Modal>

        <Modal open={Boolean(confirmDelete)} onClose={() => setConfirmDelete(null)} title="Delete this interview?">
          <p className="text-sm text-slate-500 dark:text-slate-400">This permanently removes the record and its transcript from local storage. Your analytics will recompute.</p>
          <div className="mt-6 flex justify-end gap-3">
            <Btn variant="ghost" onClick={() => setConfirmDelete(null)}>Cancel</Btn>
            <Btn variant="danger" icon={Trash2} onClick={() => doDelete(confirmDelete)}>Delete</Btn>
          </div>
        </Modal>
      </Container>
    </Page>
  );
}
