import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud, FileText, Mail, Phone, Link2, Code2, CheckCircle2, XCircle,
  RefreshCcw, KeyRound, Sparkles, History, AlertTriangle, ArrowRight, Wrench, Target,
} from 'lucide-react';
import { Page, Container, FeatureHeader } from '../components/layout';
import { Card, Btn, BtnLink, Badge, Field, Select, Ring, ErrorState, EmptyState, ProgressBar, Modal } from '../components/ui';
import { FEATURES, RESUME_ROLES } from '../constants';
import { analyzeResumeFile } from '../services/resumeService';
import { aiConfigured, aiProviderLabel, friendlyAIError } from '../services/aiService';
import { storage, KEYS, uid, fmtDateTime } from '../services/storage';
import { useApp } from '../context/AppContext';

const F = FEATURES.resume;

export default function Resume() {
  const { commitActivity, toast, refreshStats } = useApp();
  const [dragging, setDragging] = useState(false);
  const [targetRole, setTargetRole] = useState('Frontend Developer');
  const [file, setFile] = useState(null);
  const [stage, setStage] = useState('idle'); // idle | extracting | analyzing | done
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [versions, setVersions] = useState(() => storage.get(KEYS.resumes, []));
  const [showText, setShowText] = useState(false);
  const inputRef = useRef(null);

  const pickFile = (f) => {
    if (!f) return;
    setError(null);
    if (!/\.(pdf|docx)$/i.test(f.name)) {
      setError(new Error('Unsupported file type. Upload a PDF or DOCX resume.'));
      return;
    }
    if (f.size > 6 * 1024 * 1024) {
      setError(new Error('File is too large — maximum 6MB.'));
      return;
    }
    setFile(f);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  }, []);

  async function handleAnalyze() {
    if (!file || stage === 'extracting' || stage === 'analyzing') return;
    setError(null);
    try {
      setStage('extracting');
      const tick = new Promise((r) => setTimeout(r, 500));
      const promise = analyzeResumeFile(file, targetRole);
      await tick;
      setStage('analyzing');
      const analysis = await promise;
      const record = { id: uid(), ...analysis };
      storage.push(KEYS.resumes, record);
      setVersions(storage.get(KEYS.resumes, []));
      setResult(record);
      setStage('done');
      commitActivity('resume', `Resume analyzed — ${targetRole} (${analysis.analysis.score}/100)`);
      toast('success', 'Resume analyzed', `${analysis.fileName} scored ${analysis.analysis.score}/100 for ${targetRole}.`);
    } catch (e) {
      setStage('idle');
      setError(e);
      if (e.code) setError(new Error(friendlyAIError(e)));
    }
  }

  const busy = stage === 'extracting' || stage === 'analyzing';

  return (
    <Page>
      <Container className="max-w-5xl space-y-6 pt-8">
        <FeatureHeader feature="resume" />

        {!result && (
          <Card className="p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
              <div>
                {/* Dropzone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  role="button" tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                  aria-label="Upload resume"
                  className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                    dragging ? 'border-orange-400 bg-orange-50 dark:bg-orange-500/10' : 'border-slate-300 bg-slate-50/60 hover:border-orange-300 hover:bg-orange-50/40 dark:border-slate-600 dark:bg-slate-800/30 dark:hover:border-orange-500/40'
                  }`}
                >
                  <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
                  <motion.span animate={dragging ? { scale: 1.1 } : { scale: 1 }} className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${F.grad} text-white shadow-lg ${F.glowShadow}`}>
                    <UploadCloud size={24} />
                  </motion.span>
                  <p className="mt-4 font-display text-lg font-bold text-slate-900 dark:text-white">
                    {file ? file.name : 'Drag & drop your resume'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {file ? `${(file.size / 1024).toFixed(0)} KB · ready to analyze` : 'PDF or DOCX, up to 6MB — or click to browse'}
                  </p>
                  {file && (
                    <Badge className="mt-3 bg-orange-500/10 text-orange-600 dark:text-orange-400"><FileText size={12} /> {/\.pdf$/i.test(file.name) ? 'PDF' : 'DOCX'} detected</Badge>
                  )}
                </div>

                {error && (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-500/30 dark:bg-rose-500/10" role="alert">
                    <AlertTriangle size={17} className="mt-0.5 shrink-0 text-rose-500" />
                    <div>
                      <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Could not process this file</p>
                      <p className="mt-0.5 text-sm text-rose-600/90 dark:text-rose-300/80">{error.message}</p>
                    </div>
                  </div>
                )}

                {busy && (
                  <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-500/20 dark:bg-orange-500/5">
                    <div className="flex items-center gap-3">
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} className="text-orange-500"><RefreshCcw size={17} /></motion.span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                          {stage === 'extracting' ? 'Extracting text from your document…' : aiConfigured() ? `Analyzing with ${aiProviderLabel()}…` : 'Scoring against the ATS rubric…'}
                        </p>
                        <ProgressBar value={stage === 'extracting' ? 35 : 74} grad={F.grad} className="mt-2" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-between gap-4">
                <div>
                  <Field label="Target role">
                    <Select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
                      {RESUME_ROLES.map((r) => <option key={r}>{r}</option>)}
                    </Select>
                  </Field>
                  <div className="mt-4 rounded-xl border border-slate-200 p-4 text-xs leading-relaxed text-slate-500 dark:border-slate-700/60 dark:text-slate-400">
                    {aiConfigured() ? (
                      <span className="flex items-start gap-2"><Sparkles size={14} className="mt-0.5 shrink-0 text-orange-500" /> Deep AI analysis enabled ({aiProviderLabel()}) — strict ATS scoring + tailored rewrites.</span>
                    ) : (
                      <span className="flex items-start gap-2"><KeyRound size={14} className="mt-0.5 shrink-0 text-slate-400" /> No AI key — your resume still gets a fully transparent, rule-based ATS score. <BtnLink to="/settings" size="sm" variant="ghost" className="!px-1 !py-0 text-orange-500">Add key</BtnLink> for deep feedback.</span>
                    )}
                  </div>
                </div>
                <Btn size="lg" grad={F.btnGrad} onClick={handleAnalyze} disabled={!file || busy} loading={busy}>
                  {busy ? 'Analyzing…' : 'Analyze Resume'} <ArrowRight size={16} />
                </Btn>
              </div>
            </div>
          </Card>
        )}

        {result && <AnalysisView record={result} onReset={() => { setResult(null); setFile(null); setStage('idle'); setError(null); }} showText={showText} setShowText={setShowText} toast={toast} />}

        {/* Version history */}
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <History size={17} className="text-orange-500" />
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Version history</h3>
          </div>
          {versions.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No resumes analyzed yet"
              desc="Upload a resume above — the real score and every future version will be tracked here."
              accent={F.grad}
            />
          ) : (
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {[...versions].reverse().map((v, idx, arr) => {
                const prev = arr[idx + 1];
                const diff = prev ? v.analysis.score - prev.analysis.score : null;
                return (
                  <li key={v.id} className="flex flex-wrap items-center gap-4 py-3">
                    <Ring value={v.analysis.score} size={54} stroke={5} from="#f97316" to="#fb7185" label={v.analysis.score} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">{v.fileName}</p>
                      <p className="text-xs text-slate-400">{v.targetRole} · {fmtDateTime(v.analyzedAt)} · {v.analysis.mode === 'ai' ? 'AI deep analysis' : 'Rubric scoring'}</p>
                    </div>
                    {diff !== null && (
                      <Badge className={diff >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-500'}>
                        {diff >= 0 ? '+' : ''}{diff}
                      </Badge>
                    )}
                    <Btn size="sm" variant="outline" onClick={() => { setResult(v); setStage('done'); setError(null); }}>Open</Btn>
                    <Btn size="sm" variant="ghost" className="text-rose-400" onClick={() => {
                      const next = storage.get(KEYS.resumes, []).filter((x) => x.id !== v.id);
                      storage.set(KEYS.resumes, next);
                      setVersions(next);
                      refreshStats();
                      if (result?.id === v.id) setResult(null);
                    }}>Delete</Btn>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </Container>
    </Page>
  );
}

function AnalysisView({ record, onReset, showText, setShowText, toast }) {
  const a = record.analysis;
  const ex = record.extracted;
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Score header */}
      <Card className="p-6 sm:p-8">
        <div className="grid gap-8 md:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center">
            <Ring value={a.score} size={170} from="#f97316" to="#fb7185" label={a.score} sub="ATS score" />
            <Badge className={`mt-4 px-4 py-1.5 text-xs ${a.score >= 75 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : a.score >= 50 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-rose-500/10 text-rose-500'}`}>
              {a.score >= 75 ? 'Strong for screening' : a.score >= 50 ? 'Needs polish' : 'At risk in screening'}
            </Badge>
            <Badge className="mt-2 bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {a.mode === 'ai' ? `AI deep analysis · ${aiProviderLabel()}` : 'Transparent rubric scoring'}
            </Badge>
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">{ex.name || record.fileName}</h2>
              <Badge className={`${F.soft} ${F.text}`}><Target size={11} /> {record.targetRole}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400">
              {ex.email && <span className="flex items-center gap-1.5"><Mail size={14} className="text-orange-500" /> {ex.email}</span>}
              {ex.phone && <span className="flex items-center gap-1.5"><Phone size={14} className="text-orange-500" /> {ex.phone}</span>}
              {ex.linkedin && <span className="flex items-center gap-1.5"><Link2 size={14} className="text-orange-500" /> LinkedIn</span>}
              {ex.github && <span className="flex items-center gap-1.5"><Code2 size={14} className="text-orange-500" /> GitHub</span>}
              <span className="text-xs">{ex.words} words extracted</span>
            </div>
            {a.summary && <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{a.summary}</p>}
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Sections found in your real document</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ex.sections).map(([s, ok]) => (
                  <Badge key={s} className={ok ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300' : 'bg-rose-500/10 text-rose-500'}>
                    {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} />} {s}
                  </Badge>
                ))}
              </div>
            </div>
            {a.subScores && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(a.subScores).map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-slate-50 p-3 text-center dark:bg-slate-800/60">
                    <p className={`font-display text-xl font-bold ${v >= 7 ? 'text-emerald-500' : v >= 5 ? 'text-amber-500' : 'text-rose-500'}`}>{v}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{k}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Keywords */}
        <Card className="p-6">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Keyword match — {record.targetRole}</h3>
          <p className="mt-1 text-xs text-slate-400">Checked against the actual text of your document.</p>
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Matched ({a.matchedKeywords?.length || 0})</p>
            <div className="flex flex-wrap gap-1.5">
              {(a.matchedKeywords || []).length ? a.matchedKeywords.map((k) => <Badge key={k} className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">{k}</Badge>) : <span className="text-sm text-slate-400">None matched yet.</span>}
            </div>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-rose-500">Missing ({a.missingKeywords?.length || 0})</p>
            <div className="flex flex-wrap gap-1.5">
              {(a.missingKeywords || []).slice(0, 14).map((k) => <Badge key={k} className="bg-rose-500/10 text-rose-600 dark:text-rose-300">{k}</Badge>)}
            </div>
          </div>
          {ex.skillsFound.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Skills extracted from your resume</p>
              <div className="flex flex-wrap gap-1.5">
                {ex.skillsFound.map((k) => <Badge key={k} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{k}</Badge>)}
              </div>
            </div>
          )}
        </Card>

        {/* Strengths / weaknesses */}
        <Card className="p-6">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">What worked & what didn't</h3>
          <div className="mt-4 space-y-2">
            {a.strengths.map((s) => (
              <div key={s} className="flex items-start gap-2.5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-200"><CheckCircle2 size={16} className="mt-0.5 shrink-0" /> {s}</div>
            ))}
            {a.weaknesses.map((s) => (
              <div key={s} className="flex items-start gap-2.5 rounded-xl bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-500/10 dark:text-rose-200"><XCircle size={16} className="mt-0.5 shrink-0" /> {s}</div>
            ))}
          </div>
        </Card>
      </div>

      {/* Improvement checklist */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Wrench size={17} className="text-orange-500" />
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Improvement checklist</h3>
        </div>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
          {a.improvements.map((s) => (
            <li key={s} className="flex items-start gap-2.5 rounded-xl border border-slate-200 p-3.5 text-sm text-slate-600 dark:border-slate-700/60 dark:text-slate-300">
              <ArrowRight size={15} className="mt-0.5 shrink-0 text-orange-500" /> {s}
            </li>
          ))}
        </ul>
        {(a.projectTips?.length || a.experienceTips?.length) ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-orange-50 p-4 dark:bg-orange-500/5">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">Projects</p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">{a.projectTips.map((t) => <li key={t}>· {t}</li>)}</ul>
            </div>
            <div className="rounded-xl bg-rose-50 p-4 dark:bg-rose-500/5">
              <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Experience</p>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">{a.experienceTips.map((t) => <li key={t}>· {t}</li>)}</ul>
            </div>
          </div>
        ) : null}
      </Card>

      {/* Transparent rubric */}
      {a.checks && (
        <Card className="p-6">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Scoring rubric <span className="text-sm font-medium text-slate-400">— exactly how your score was computed</span></h3>
          <div className="mt-4 space-y-3">
            {a.checks.map((c) => (
              <div key={c.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-300">{c.label}</span>
                  <span className="font-bold text-slate-500">{Math.round(c.pts)}/{c.max}</span>
                </div>
                <ProgressBar value={(c.pts / c.max) * 100} grad={c.pts / c.max >= 0.7 ? 'from-emerald-500 to-teal-400' : c.pts / c.max >= 0.4 ? 'from-amber-400 to-orange-400' : 'from-rose-500 to-orange-400'} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Btn grad={F.btnGrad} icon={RefreshCcw} onClick={onReset}>Analyze another version</Btn>
        <Btn variant="outline" onClick={() => setShowText(true)}>View extracted text</Btn>
      </div>

      <Modal open={showText} onClose={() => setShowText(false)} title="Text extracted from your document" wide>
        <pre className="max-h-[50vh] overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">{record.textPreview}</pre>
        <p className="mt-3 text-xs text-slate-400">Parsing failed for an element? The analysis above is based purely on this extracted text.</p>
      </Modal>
    </motion.div>
  );
}
