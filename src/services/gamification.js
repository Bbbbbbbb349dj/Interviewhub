import { storage, KEYS } from './storage';

export const ACHIEVEMENTS = [
  { id: 'first-interview', title: 'First Interview', desc: 'Complete your first AI interview', check: (s) => s.interviews.count >= 1 },
  { id: 'interview-champion', title: 'Interview Champion', desc: 'Complete 5 AI interviews', check: (s) => s.interviews.count >= 5 },
  { id: 'top-performer', title: 'Top Performer', desc: 'Score 8+/10 in an interview', check: (s) => s.interviews.maxScore >= 8 },
  { id: 'first-code', title: 'Hello, World', desc: 'Make your first coding submission', check: (s) => s.coding.total >= 1 },
  { id: 'coding-hero', title: 'Coding Hero', desc: 'Make 10 coding submissions', check: (s) => s.coding.total >= 10 },
  { id: 'flawless', title: 'Flawless Execution', desc: 'Pass every test case on a problem', check: (s) => s.coding.anyPerfect },
  { id: 'aptitude-first', title: 'Brain Warmup', desc: 'Finish your first aptitude test', check: (s) => s.aptitude.attempts.length >= 1 },
  { id: 'aptitude-master', title: 'Aptitude Master', desc: 'Reach 80% accuracy over 10+ questions', check: (s) => (s.aptitude.accuracy ?? 0) >= 80 && s.aptitude.total >= 10 },
  { id: 'first-speech', title: 'Finding Your Voice', desc: 'Complete a communication session', check: (s) => s.comm.count >= 1 },
  { id: 'resume-uploaded', title: 'On Paper', desc: 'Analyze your resume', check: (s) => s.resume.versions.length >= 1 },
  { id: 'resume-ready', title: 'Resume Ready', desc: 'Reach a resume score of 75+', check: (s) => (s.resume.latest?.analysis.score ?? 0) >= 75 },
  { id: 'streak-3', title: '3 Day Streak', desc: 'Practice 3 days in a row', check: (s) => s.streak >= 3 },
  { id: 'streak-7', title: '7 Day Streak', desc: 'Practice 7 days in a row', check: (s) => s.streak >= 7 },
  { id: 'explorer', title: 'Full Stack Prep', desc: 'Use 4 different modules', check: (s) => s.modulesUsed >= 4 },
];

export function getUnlocked() {
  return storage.get(KEYS.achievements, []);
}

/** Evaluate all achievements against real stats; returns newly unlocked ones. */
export function evaluateAchievements(stats) {
  const unlocked = getUnlocked();
  const have = new Set(unlocked.map((a) => a.id));
  const fresh = [];
  ACHIEVEMENTS.forEach((a) => {
    if (!have.has(a.id) && a.check(stats)) {
      fresh.push({ id: a.id, title: a.title, desc: a.desc, ts: Date.now() });
    }
  });
  if (fresh.length) storage.set(KEYS.achievements, [...unlocked, ...fresh]);
  return fresh;
}
