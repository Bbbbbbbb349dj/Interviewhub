import {
  Mic, FileText, Code2, Calculator, MessagesSquare, BarChart3, Trophy, LayoutGrid,
} from 'lucide-react';

export const APP_NAME = 'InterviewHub';
export const TAGLINE = ['Prepare Smarter.', 'Perform Better.', 'Get Hired.'];
export const SUBLINE =
  'Practice interviews, analyze your resume, solve coding problems, improve communication, and become placement-ready — all in one platform.';

/* Multi-color feature identity — used consistently everywhere. */
export const FEATURES = {
  interview: {
    key: 'interview', name: 'AI Voice Interview', short: 'Interview', path: '/interview',
    icon: Mic, hex: '#06b6d4',
    grad: 'from-blue-500 to-cyan-400', btnGrad: 'from-blue-600 to-cyan-500',
    soft: 'bg-cyan-50 dark:bg-cyan-400/10', text: 'text-cyan-600 dark:text-cyan-400',
    ring: 'ring-cyan-500/30', glowShadow: 'shadow-cyan-500/25',
    desc: 'Real-time AI interviews with voice, adaptive questions and per-answer scoring.',
  },
  resume: {
    key: 'resume', name: 'Resume Analyzer', short: 'Resume', path: '/resume',
    icon: FileText, hex: '#f97316',
    grad: 'from-orange-500 to-rose-400', btnGrad: 'from-orange-500 to-rose-500',
    soft: 'bg-orange-50 dark:bg-orange-400/10', text: 'text-orange-600 dark:text-orange-400',
    ring: 'ring-orange-500/30', glowShadow: 'shadow-orange-500/25',
    desc: 'Parse real PDF/DOCX resumes, score ATS compatibility and close keyword gaps.',
  },
  coding: {
    key: 'coding', name: 'Coding Arena', short: 'Coding', path: '/coding',
    icon: Code2, hex: '#10b981',
    grad: 'from-emerald-500 to-cyan-400', btnGrad: 'from-emerald-600 to-teal-500',
    soft: 'bg-emerald-50 dark:bg-emerald-400/10', text: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-500/30', glowShadow: 'shadow-emerald-500/25',
    desc: 'Solve real problems in a real editor with sandboxed execution and AI code review.',
  },
  aptitude: {
    key: 'aptitude', name: 'Aptitude & Reasoning', short: 'Aptitude', path: '/aptitude',
    icon: Calculator, hex: '#f59e0b',
    grad: 'from-amber-400 to-orange-500', btnGrad: 'from-amber-500 to-orange-500',
    soft: 'bg-amber-50 dark:bg-amber-400/10', text: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-500/30', glowShadow: 'shadow-amber-500/25',
    desc: 'Timed quantitative, logical, verbal and technical MCQ tests with topic analytics.',
  },
  communication: {
    key: 'communication', name: 'Communication Coach', short: 'Speaking', path: '/communication',
    icon: MessagesSquare, hex: '#ec4899',
    grad: 'from-pink-500 to-rose-400', btnGrad: 'from-pink-600 to-rose-500',
    soft: 'bg-pink-50 dark:bg-pink-400/10', text: 'text-pink-600 dark:text-pink-400',
    ring: 'ring-pink-500/30', glowShadow: 'shadow-pink-500/25',
    desc: 'Speak, get transcribed, and receive clarity, grammar and fluency coaching.',
  },
  analytics: {
    key: 'analytics', name: 'Performance Analytics', short: 'Analytics', path: '/analytics',
    icon: BarChart3, hex: '#6366f1',
    grad: 'from-indigo-500 to-blue-400', btnGrad: 'from-indigo-600 to-blue-500',
    soft: 'bg-indigo-50 dark:bg-indigo-400/10', text: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-500/30', glowShadow: 'shadow-indigo-500/25',
    desc: 'Every chart is computed from your real activity — nothing invented.',
  },
  achievements: {
    key: 'achievements', name: 'Achievements', short: 'Badges', path: '/dashboard',
    icon: Trophy, hex: '#eab308',
    grad: 'from-yellow-400 to-orange-400', btnGrad: 'from-yellow-500 to-orange-500',
    soft: 'bg-yellow-50 dark:bg-yellow-400/10', text: 'text-yellow-600 dark:text-yellow-400',
    ring: 'ring-yellow-500/30', glowShadow: 'shadow-yellow-500/25',
    desc: 'Earn badges and streaks for real milestones you hit.',
  },
  practice: {
    key: 'practice', name: 'Practice Hub', short: 'Practice', path: '/practice',
    icon: LayoutGrid, hex: '#14b8a6',
    grad: 'from-teal-500 to-cyan-400', btnGrad: 'from-teal-600 to-cyan-500',
    soft: 'bg-teal-50 dark:bg-teal-400/10', text: 'text-teal-600 dark:text-teal-400',
    ring: 'ring-teal-500/30', glowShadow: 'shadow-teal-500/25',
    desc: 'One hub for interviews, coding, aptitude, core CS subjects and more.',
  },
};

export const FEATURE_LIST = [
  FEATURES.interview, FEATURES.resume, FEATURES.coding,
  FEATURES.aptitude, FEATURES.communication, FEATURES.analytics,
];

export const ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'React Developer',
  'Node.js Developer', 'Python Developer', 'Java Developer', 'C++ Developer',
  'AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'Data Analyst',
  'DevOps Engineer', 'Cloud Engineer', 'Cyber Security Analyst', 'Android Developer',
  'Software Tester', 'General Placement',
];

export const INTERVIEW_TYPES = ['HR', 'Technical', 'Behavioral', 'Coding Discussion', 'System Design', 'Mixed'];
export const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
export const QUESTION_COUNTS = [5, 10, 15];

export const RESUME_ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Python Developer',
  'Java Developer', 'AI Engineer', 'Data Scientist', 'DevOps Engineer',
];

/* Keywords used for honest, rule-based ATS gap analysis. */
export const ROLE_KEYWORDS = {
  'Frontend Developer': ['javascript', 'typescript', 'react', 'html', 'css', 'redux', 'responsive', 'webpack', 'vite', 'rest api', 'git', 'accessibility', 'testing', 'tailwind', 'performance', 'ui'],
  'Backend Developer': ['node', 'express', 'sql', 'nosql', 'mongodb', 'rest api', 'authentication', 'docker', 'microservices', 'caching', 'redis', 'postgres', 'python', 'java', 'scalability', 'ci/cd'],
  'Full Stack Developer': ['javascript', 'react', 'node', 'express', 'sql', 'mongodb', 'rest api', 'git', 'docker', 'authentication', 'ci/cd', 'typescript', 'deployment', 'testing', 'redis', 'aws'],
  'Python Developer': ['python', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'sql', 'rest api', 'pytest', 'automation', 'git', 'oop', 'data structures', 'linux', 'docker', 'api'],
  'Java Developer': ['java', 'spring', 'spring boot', 'hibernate', 'sql', 'rest api', 'microservices', 'maven', 'junit', 'git', 'multithreading', 'collections', 'docker', 'kafka', 'api', 'oop'],
  'AI Engineer': ['python', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'nlp', 'llm', 'transformers', 'mlops', 'pandas', 'numpy', 'scikit-learn', 'api', 'model deployment', 'rag', 'computer vision'],
  'Data Scientist': ['python', 'statistics', 'machine learning', 'pandas', 'numpy', 'sql', 'data visualization', 'scikit-learn', 'a/b testing', 'regression', 'classification', 'tableau', 'power bi', 'feature engineering', 'jupyter', 'r'],
  'DevOps Engineer': ['linux', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'terraform', 'aws', 'azure', 'monitoring', 'bash', 'ansible', 'git', 'networking', 'security', 'grafana', 'prometheus'],
};

export const COMM_PROMPTS = [
  { id: 'intro', label: 'Tell me about yourself', hint: 'Structure: present role → key strength → proof → why this role. Aim for 60–90 seconds.' },
  { id: 'strength', label: 'What is your greatest strength?', hint: 'Name one strength, give one concrete example, connect it to the job.' },
  { id: 'weakness', label: 'What is a weakness you are working on?', hint: 'Be honest, show self-awareness, and end with the improvement plan.' },
  { id: 'conflict', label: 'Describe a conflict in a team and how you resolved it', hint: 'Use STAR: Situation, Task, Action, Result.' },
  { id: 'project', label: 'Explain your favorite project to a non-technical manager', hint: 'Avoid jargon. Focus on the problem, your role, and the impact.' },
  { id: 'why', label: 'Why should we hire you?', hint: 'Match 2–3 of your skills to their needs and show enthusiasm.' },
];

export const APT_CATEGORIES = [
  { key: 'quant', name: 'Quantitative Aptitude' },
  { key: 'logical', name: 'Logical Reasoning' },
  { key: 'verbal', name: 'Verbal Reasoning' },
  { key: 'data', name: 'Data Interpretation' },
  { key: 'os', name: 'Operating Systems' },
  { key: 'dbms', name: 'DBMS & SQL' },
  { key: 'cn', name: 'Computer Networks' },
  { key: 'oop', name: 'OOP Concepts' },
];

export const DIFF_COLOR = {
  Easy: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
  Medium: 'text-amber-600 dark:text-amber-400 bg-amber-500/10',
  Hard: 'text-rose-600 dark:text-rose-400 bg-rose-500/10',
};

export const prize = (n) => n;
