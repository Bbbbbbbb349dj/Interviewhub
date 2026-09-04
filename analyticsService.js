import { storage, KEYS } from './storage';

/* Every number here is computed from real user activity in LocalStorage.
 * If the user has done nothing, everything is empty/zero — no invented data. */

export function getCodingStats() {
  const attempts = storage.get(KEYS.coding, []);
  const total = attempts.length;
  const accuracy = total
    ? Math.round(attempts.reduce((a, x) => a + (x.total ? x.passed / x.total : 0), 0) / total * 100)
    : null;
  const solvedIds = new Set();
  attempts.forEach((x) => { if (x.total > 0 && x.passed === x.total) solvedIds.add(x.problemId); });
  const languages = {};
  attempts.forEach((x) => { languages[x.language] = (languages[x.language] || 0) + 1; });
  return { attempts, total, accuracy, solved: solvedIds.size, languages, anyPerfect: attempts.some((x) => x.total >= 3 && x.passed === x.total) };
}

export function getAptitudeStats() {
  const attempts = storage.get(KEYS.aptitude, []);
  let correct = 0, total = 0;
  const perTopic = {};
  attempts.forEach((a) => {
    correct += a.correct; total += a.total;
    Object.entries(a.perTopic || {}).forEach(([cat, v]) => {
      perTopic[cat] = perTopic[cat] || { correct: 0, total: 0 };
      perTopic[cat].correct += v.correct; perTopic[cat].total += v.total;
    });
  });
  return {
    attempts, total, correct,
    accuracy: total ? Math.round((correct / total) * 100) : null,
    perTopic,
  };
}

export function getInterviewStats() {
  const interviews = storage.get(KEYS.interviews, []);
  const scored = interviews.filter((i) => i.average?.overall);
  const avgScore = scored.length
    ? +(scored.reduce((a, i) => a + i.average.overall, 0) / scored.length).toFixed(1)
    : null;
  const maxScore = scored.length ? Math.max(...scored.map((i) => i.average.overall)) : 0;
  const dimAvg = {};
  ['technicalKnowledge', 'communication', 'confidence', 'problemSolving'].forEach((d) => {
    const vals = scored.map((i) => i.average[d]).filter(Boolean);
    dimAvg[d] = vals.length ? +(vals.reduce((a, v) => a + v, 0) / vals.length).toFixed(1) : null;
  });
  return { interviews, count: interviews.length, avgScore, maxScore, dimAvg, scored };
}

export function getCommStats() {
  const sessions = storage.get(KEYS.comm, []);
  const scored = sessions.filter((s) => s.scores?.overall);
  const avg = scored.length ? +(scored.reduce((a, s) => a + s.scores.overall, 0) / scored.length).toFixed(1) : null;
  return { sessions, count: sessions.length, avg };
}

export function getResumeStats() {
  const versions = storage.get(KEYS.resumes, []);
  const latest = versions.length ? versions[versions.length - 1] : null;
  return { versions, latest };
}

function activityDays() {
  const days = new Set();
  const add = (ts) => ts && days.add(new Date(ts).toDateString());
  storage.get(KEYS.interviews, []).forEach((i) => add(i.endedAt));
  storage.get(KEYS.coding, []).forEach((a) => add(a.ts));
  storage.get(KEYS.aptitude, []).forEach((a) => add(a.ts));
  storage.get(KEYS.comm, []).forEach((s) => add(s.ts));
  storage.get(KEYS.resumes, []).forEach((r) => add(r.analyzedAt));
  return days;
}

export function getStreak() {
  const days = activityDays();
  if (!days.size) return 0;
  let streak = 0;
  const cursor = new Date();
  // Allow the streak to be alive if the last activity was today or yesterday.
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function computeAll() {
  const coding = getCodingStats();
  const aptitude = getAptitudeStats();
  const interviews = getInterviewStats();
  const comm = getCommStats();
  const resume = getResumeStats();
  const streak = getStreak();
  const activity = storage.get(KEYS.activity, []).slice(-40).reverse();

  const modulesUsed = [
    interviews.count > 0, coding.total > 0, aptitude.total > 0, comm.count > 0, resume.versions.length > 0,
  ].filter(Boolean).length;

  const hasAnyData = modulesUsed > 0;

  /* Readiness: weighted composite over signals that actually exist. */
  const signals = [];
  if (interviews.avgScore != null) signals.push([interviews.avgScore * 10, 0.35]);
  if (coding.accuracy != null) signals.push([coding.accuracy, 0.25]);
  if (aptitude.accuracy != null) signals.push([aptitude.accuracy, 0.15]);
  if (comm.avg != null) signals.push([comm.avg * 10, 0.1]);
  if (resume.latest) signals.push([resume.latest.analysis.score, 0.15]);
  const wSum = signals.reduce((a, [, w]) => a + w, 0);
  const readiness = signals.length ? Math.round(signals.reduce((a, [v, w]) => a + v * w, 0) / wSum) : null;

  const radar = [
    { label: 'Technical', value: interviews.dimAvg.technicalKnowledge != null ? interviews.dimAvg.technicalKnowledge * 10 : (aptitude.accuracy ?? null) },
    { label: 'Coding', value: coding.accuracy },
    { label: 'Communication', value: comm.avg != null ? comm.avg * 10 : (interviews.dimAvg.communication != null ? interviews.dimAvg.communication * 10 : null) },
    { label: 'Aptitude', value: aptitude.accuracy },
    { label: 'Resume', value: resume.latest ? resume.latest.analysis.score : null },
    { label: 'Confidence', value: interviews.dimAvg.confidence != null ? interviews.dimAvg.confidence * 10 : null },
  ];

  const trend = interviews.scored
    .slice()
    .sort((a, b) => a.endedAt - b.endedAt)
    .map((i) => ({ label: new Date(i.endedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), score: i.average.overall * 10 }));

  return { coding, aptitude, interviews, comm, resume, streak, activity, modulesUsed, hasAnyData, readiness, radar, trend };
}
