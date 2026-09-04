import { askJSON, normalizeScores, clamp } from './aiService';

/* Builds the interviewer persona. The model IS the interviewer — questions and
 * follow-ups are generated from live conversation context (adaptive). */
function systemPrompt(cfg) {
  return `You are "Iris", a senior ${cfg.type} interviewer at a top tech company, interviewing a candidate for the role of ${cfg.role}. Base difficulty: ${cfg.difficulty}. The interview has ${cfg.count} main questions.

Behaviour rules:
- Act exactly like a real interviewer: professional, warm but direct.
- This interview is ADAPTIVE. If the candidate answers strongly, increase difficulty. If they struggle, simplify or probe fundamentals. If they mention a project, technology or experience, ask a concrete follow-up about it.
- Ask ONE question at a time. Never reveal future questions.
- Keep questions concise (1–3 sentences).
- You must ALWAYS respond with a single valid JSON object. No markdown, no commentary outside JSON.`;
}

const trim = (s, n = 900) => (s || '').length > n ? s.slice(0, n) + '…' : (s || '');

function historyText(transcript) {
  return transcript.map((t, i) => `Q${i + 1}: ${trim(t.question, 300)}\nA${i + 1}: ${trim(t.answer)}`).join('\n\n');
}

/** Generate the opening question. */
export async function startInterview(cfg) {
  const data = await askJSON(
    systemPrompt(cfg),
    `Begin the interview now. Greet the candidate in one short sentence and ask question 1 of ${cfg.count}.
Return JSON: {"greeting":"...","question":"..."}`,
  );
  if (!data.question) throw new Error('AI did not return an opening question.');
  return { greeting: data.greeting || '', question: String(data.question) };
}

/** Evaluate the candidate's real answer and produce the next adaptive question. */
export async function evaluateAnswer(cfg, transcript, question, answer, isLast) {
  const schema = `Return JSON exactly in this shape:
{
  "evaluation": {"overall": 1-10, "technicalKnowledge": 1-10, "communication": 1-10, "confidence": 1-10, "accuracy": 1-10, "completeness": 1-10, "problemSolving": 1-10, "grammar": 1-10},
  "oneLineFeedback": "one sentence of direct feedback",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "improvements": ["actionable suggestion"],
  "betterAnswer": "a strong 2-4 sentence model answer",
  "topicsToRevise": ["..."],
  "acknowledgement": "one natural interviewer sentence reacting to the answer",
  "nextQuestion": "${isLast ? 'empty string, interview over' : 'your next adaptive question based on the whole conversation'}"
}`;
  const user = `Conversation so far:\n${historyText(transcript)}\n\nLatest question: ${question}\nCandidate's answer: ${trim(answer, 2000)}\n\nEvaluate the candidate's ACTUAL answer strictly. Scores must reflect this answer only. ${isLast ? 'This was the final question.' : 'Then generate the next question (adapt difficulty and follow up on anything interesting they mentioned).'}\n${schema}`;
  const data = await askJSON(systemPrompt(cfg), user);
  return {
    evaluation: normalizeScores(data.evaluation),
    oneLineFeedback: String(data.oneLineFeedback || ''),
    strengths: [].concat(data.strengths || []).slice(0, 4).map(String),
    weaknesses: [].concat(data.weaknesses || []).slice(0, 4).map(String),
    improvements: [].concat(data.improvements || []).slice(0, 4).map(String),
    betterAnswer: String(data.betterAnswer || ''),
    topicsToRevise: [].concat(data.topicsToRevise || []).slice(0, 5).map(String),
    acknowledgement: String(data.acknowledgement || ''),
    nextQuestion: isLast ? '' : String(data.nextQuestion || ''),
  };
}

/** Final holistic summary of the completed interview. */
export async function summarizeInterview(cfg, transcript) {
  const avg = averageScores(transcript);
  const data = await askJSON(
    systemPrompt(cfg),
    `The ${cfg.type} interview for ${cfg.role} is over. Full transcript:\n\n${historyText(transcript)}\n\nNumeric averages (0-10): ${JSON.stringify(avg)}\n\nWrite the final assessment. Return JSON:
{"summary":"3-4 sentence holistic assessment","strongAreas":["..."],"weakAreas":["..."],"recommendedPractice":["specific practice actions"],"hireReadiness":"one of: Not Ready Yet | Developing | Almost Ready | Interview Ready"}`,
  );
  return {
    summary: String(data.summary || ''),
    strongAreas: [].concat(data.strongAreas || []).map(String),
    weakAreas: [].concat(data.weakAreas || []).map(String),
    recommendedPractice: [].concat(data.recommendedPractice || []).map(String),
    hireReadiness: String(data.hireReadiness || 'Developing'),
  };
}

/* Honest numeric aggregation of real per-answer scores. */
export function averageScores(transcript) {
  const dims = ['overall', 'technicalKnowledge', 'communication', 'confidence', 'accuracy', 'completeness', 'problemSolving', 'grammar'];
  const scored = transcript.filter((t) => t.feedback?.evaluation);
  if (!scored.length) return null;
  const out = {};
  dims.forEach((d) => {
    out[d] = +(scored.reduce((a, t) => a + (t.feedback.evaluation[d] || 0), 0) / scored.length).toFixed(1);
  });
  return out;
}

export function localSummary(cfg, transcript, durationSec) {
  const avg = averageScores(transcript) || {};
  const strongCaps = Object.entries(avg).filter(([k, v]) => k !== 'overall' && v >= 7).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  const weakCaps = Object.entries(avg).filter(([k, v]) => k !== 'overall' && v < 6).sort((a, b) => a[1] - b[1]).map(([k]) => k);
  const allTopics = [...new Set(transcript.flatMap((t) => t.feedback?.topicsToRevise || []))];
  return {
    average: avg,
    summary: `You completed a ${cfg.type} interview for ${cfg.role} (${transcript.length} questions, ${Math.round(durationSec / 60)} min). Average score ${avg.overall ?? '—'}/10.`,
    strongAreas: strongCaps.map(prettyDim),
    weakAreas: [...weakCaps.map(prettyDim), ...allTopics.slice(0, 4)],
    recommendedPractice: allTopics.length
      ? allTopics.slice(0, 5).map((t) => `Revise: ${t}`)
      : ['Take another interview at a higher difficulty to keep improving.'],
    hireReadiness: avg.overall >= 8 ? 'Interview Ready' : avg.overall >= 6.5 ? 'Almost Ready' : avg.overall >= 5 ? 'Developing' : 'Not Ready Yet',
  };
}

const prettyDim = (d) => d.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
export { prettyDim, clamp };
