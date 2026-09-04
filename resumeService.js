import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import JSZip from 'jszip';
import { askJSON, aiConfigured, clamp } from './aiService';
import { ROLE_KEYWORDS } from '../constants';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_BYTES = 6 * 1024 * 1024;

const COMMON_TECH = [
  'javascript', 'typescript', 'react', 'angular', 'vue', 'node', 'express', 'python', 'java', 'c++', 'c#', 'go', 'rust',
  'html', 'css', 'sql', 'mysql', 'postgres', 'mongodb', 'redis', 'django', 'flask', 'spring', 'git', 'docker',
  'kubernetes', 'aws', 'azure', 'gcp', 'linux', 'rest api', 'graphql', 'ci/cd', 'jenkins', 'terraform', 'pandas',
  'numpy', 'machine learning', 'deep learning', 'pytorch', 'tensorflow', 'scikit-learn', 'tableau', 'power bi',
  'figma', 'tailwind', 'redux', 'next.js', 'firebase', 'kafka', 'microservices', 'agile', 'testing', 'selenium',
];

const ACTION_VERBS = ['built', 'developed', 'designed', 'led', 'created', 'implemented', 'improved', 'launched', 'optimized', 'reduced', 'increased', 'architected', 'automated', 'delivered', 'engineered', 'managed', 'shipped', 'migrated', 'scaled', 'mentored'];

export function validateFile(file) {
  if (!file) throw new Error('No file selected.');
  if (file.size > MAX_BYTES) throw new Error('File is too large — maximum 6MB.');
  const ok = /\.(pdf|docx)$/i.test(file.name);
  if (!ok) throw new Error('Unsupported file type. Upload a PDF or DOCX resume.');
  return /\.pdf$/i.test(file.name) ? 'pdf' : 'docx';
}

/* ---------- Real text extraction ---------- */
async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
  let out = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    let line = '';
    content.items.forEach((item) => {
      line += item.str;
      if (item.hasEOL) { out.push(line.trim()); line = ''; }
      else line += ' ';
    });
    if (line.trim()) out.push(line.trim());
  }
  return out.join('\n');
}

async function extractDocxText(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const doc = zip.file('word/document.xml');
  if (!doc) throw new Error('This DOCX does not contain a readable document body.');
  const xml = await doc.async('string');
  const text = xml
    .replace(/<\/w:p>/g, '\n')
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  return text;
}

export async function extractText(file) {
  const kind = validateFile(file);
  const text = kind === 'pdf' ? await extractPdfText(file) : await extractDocxText(file);
  const cleaned = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  if (cleaned.split(/\s+/).length < 30) {
    throw new Error('Could not extract enough text. If this is a scanned/image PDF, export a text-based copy and retry.');
  }
  return cleaned;
}

/* ---------- Entity & section extraction ---------- */
export function parseResume(text) {
  const email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [null])[0];
  const phone = (text.match(/(\+?\d[\d\s().-]{8,15}\d)/) || [null])[0];
  const linkedin = (text.match(/linkedin\.com\/[A-Za-z0-9\-_/]+/i) || [null])[0];
  const github = (text.match(/github\.com\/[A-Za-z0-9\-_/]+/i) || [null])[0];

  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const firstLine = lines.find((l) => l.length < 45 && !/@|resume|curriculum|phone|\d{5,}/i.test(l) && /^[A-Za-z .'-]+$/.test(l));
  const name = firstLine ? firstLine.replace(/\s+/g, ' ') : null;

  const sectionRegex = {
    summary: /(summary|objective|profile)\b/i,
    skills: /(skills|technologies|tech stack)\b/i,
    experience: /(experience|employment|work history|internship)\b/i,
    projects: /(projects|portfolio)\b/i,
    education: /(education|academic)\b/i,
    certifications: /(certifications?|courses?|licenses?)\b/i,
    achievements: /(achievements?|awards?|honors?)\b/i,
  };
  const sections = {};
  Object.entries(sectionRegex).forEach(([k, re]) => { sections[k] = re.test(text); });

  const lower = text.toLowerCase();
  const skillsFound = [...new Set(COMMON_TECH.filter((t) => lower.includes(t)))];

  const words = text.split(/\s+/).length;
  const bulletCount = (text.match(/[•\-\u2022▪◦*]\s/g) || []).length;
  const actionVerbsFound = ACTION_VERBS.filter((v) => new RegExp(`\\b${v}`, 'i').test(text));
  const quantified = (text.match(/\b\d+(\.\d+)?\s?(%|percent|x\b|k\b|users|customers|requests|ms\b|s\b|\$)/gi) || []).length;

  return { email, phone, linkedin, github, name, sections, skillsFound, words, bulletCount, actionVerbsFound, quantified };
}

/* ---------- Transparent, rule-based ATS scoring (no AI needed) ---------- */
export function heuristicAnalysis(text, meta, targetRole) {
  const checks = [];
  const contactOk = Boolean(meta.email && meta.phone);
  checks.push({ label: 'Contact information (email + phone)', pts: contactOk ? 10 : meta.email || meta.phone ? 5 : 0, max: 10 });

  const core = ['skills', 'experience', 'projects', 'education'];
  const coreCount = core.filter((s) => meta.sections[s]).length;
  checks.push({ label: 'Core sections (skills, experience, projects, education)', pts: coreCount * 3.75, max: 15 });

  checks.push({ label: 'Action verbs in bullets', pts: Math.min(10, meta.actionVerbsFound.length * 2), max: 10 });
  checks.push({ label: 'Quantified achievements (numbers, %, scale)', pts: Math.min(10, meta.quantified * 3), max: 10 });

  const roleKw = ROLE_KEYWORDS[targetRole] || [];
  const lower = text.toLowerCase();
  const matched = roleKw.filter((k) => lower.includes(k));
  const coverage = roleKw.length ? matched.length / roleKw.length : 0;
  checks.push({ label: `Keyword coverage for ${targetRole} (${matched.length}/${roleKw.length})`, pts: Math.round(coverage * 25), max: 25 });

  const lenPts = meta.words < 120 ? 4 : meta.words > 1200 ? 6 : 10;
  checks.push({ label: `Length (${meta.words} words)`, pts: lenPts, max: 10 });

  checks.push({ label: 'Bullet-structured content', pts: meta.bulletCount >= 4 ? 10 : meta.bulletCount > 0 ? 5 : 0, max: 10 });
  checks.push({ label: 'Summary / objective section', pts: meta.sections.summary ? 5 : 0, max: 5 });
  checks.push({ label: 'Portfolio links (LinkedIn/GitHub)', pts: meta.linkedin || meta.github ? 5 : 0, max: 5 });

  const score = clamp(checks.reduce((a, c) => a + c.pts, 0), 0, 100);
  const missing = roleKw.filter((k) => !matched.includes(k));

  const strengths = [];
  if (contactOk) strengths.push('Complete contact details');
  if (meta.quantified >= 2) strengths.push('Achievements backed by numbers');
  if (meta.actionVerbsFound.length >= 5) strengths.push('Strong, active language');
  if (coverage >= 0.5) strengths.push(`Good keyword alignment with ${targetRole}`);
  if (meta.sections.projects) strengths.push('Dedicated projects section');

  const weaknesses = [];
  if (!contactOk) weaknesses.push('Missing email or phone number');
  if (coreCount < 4) weaknesses.push(`Missing section: ${core.filter((s) => !meta.sections[s]).join(', ')}`);
  if (meta.quantified < 2) weaknesses.push('Few quantified results — add measurable impact');
  if (coverage < 0.5) weaknesses.push(`Low keyword match for ${targetRole}`);
  if (meta.bulletCount < 4) weaknesses.push('Content is not bullet-structured');
  if (!meta.sections.summary) weaknesses.push('No professional summary at the top');

  const improvements = [
    !contactOk && 'Add a clearly visible email and phone number in the header.',
    meta.quantified < 2 && 'Quantify outcomes: "reduced load time by 40%", "served 2k users".',
    coverage < 0.6 && `Work in missing ${targetRole} keywords your experience genuinely supports: ${missing.slice(0, 5).join(', ')}.`,
    meta.bulletCount < 4 && 'Rewrite paragraphs as crisp bullet points starting with action verbs.',
    !meta.sections.summary && 'Add a 2–3 line professional summary tailored to the target role.',
    meta.words < 250 && 'Expand projects/experience — describe impact, stack and your role.',
  ].filter(Boolean);

  return {
    mode: 'heuristic',
    score,
    checks,
    matchedKeywords: matched,
    missingKeywords: missing,
    strengths,
    weaknesses,
    improvements,
    skills: meta.skillsFound,
    projectTips: ['Lead each project with the problem it solves, then stack, then measurable result.'],
    experienceTips: ['Format: Role — Company (dates), then 3–5 quantified bullets. Put the strongest result first.'],
  };
}

/* ---------- Deep AI analysis over the real extracted text ---------- */
export async function aiAnalysis(text, meta, targetRole) {
  const trimmed = text.slice(0, 12000);
  const data = await askJSON(
    'You are an expert ATS (Applicant Tracking System) and senior technical recruiter. Analyze resumes strictly and return only valid JSON.',
    `Analyze this real resume for the target role "${targetRole}".

Extracted basics: sections=${JSON.stringify(meta.sections)}, words=${meta.words}, skillsDetected=${meta.skillsFound.join(', ') || 'none'}.

RESUME TEXT:
"""
${trimmed}
"""

Return JSON exactly:
{"atsScore":0-100,"clarity":0-10,"impact":0-10,"relevance":0-10,"grammar":0-10,
"summary":"2-3 sentence overall verdict",
"strengths":["..."],"weaknesses":["..."],
"missingKeywords":["important keywords for the role this resume lacks"],
"suggestions":["specific, actionable rewrite suggestions"],
"projectImprovements":["..."],"experienceImprovements":["..."],
"skillsToAdd":["skills worth learning/adding for this role"],
"sectionFeedback":{"summary":"...","experience":"...","projects":"...","skills":"...","education":"..."}}`,
  );
  return {
    mode: 'ai',
    score: clamp(data.atsScore, 0, 100),
    subScores: {
      Clarity: clamp(data.clarity, 1, 10), Impact: clamp(data.impact, 1, 10),
      Relevance: clamp(data.relevance, 1, 10), Grammar: clamp(data.grammar, 1, 10),
    },
    summary: String(data.summary || ''),
    strengths: [].concat(data.strengths || []),
    weaknesses: [].concat(data.weaknesses || []),
    missingKeywords: [].concat(data.missingKeywords || []),
    improvements: [].concat(data.suggestions || []),
    projectTips: [].concat(data.projectImprovements || []),
    experienceTips: [].concat(data.experienceImprovements || []),
    skillsToAdd: [].concat(data.skillsToAdd || []),
    sectionFeedback: data.sectionFeedback || {},
    skills: meta.skillsFound,
    matchedKeywords: (ROLE_KEYWORDS[targetRole] || []).filter((k) => text.toLowerCase().includes(k)),
    checks: heuristicAnalysis(text, meta, targetRole).checks,
  };
}

/** Full pipeline: extract → parse → analyze (AI when configured, honest heuristic otherwise). */
export async function analyzeResumeFile(file, targetRole) {
  const text = await extractText(file);
  const meta = parseResume(text);
  const analysis = aiConfigured()
    ? await aiAnalysis(text, meta, targetRole)
    : heuristicAnalysis(text, meta, targetRole);
  return {
    fileName: file.name,
    fileSize: file.size,
    targetRole,
    analyzedAt: Date.now(),
    extracted: meta,
    textPreview: text.slice(0, 1200),
    analysis,
  };
}
