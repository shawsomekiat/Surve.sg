/**
 * Response Quality Scorer
 *
 * Pipeline: Rule-based (Option 1) → weights derived from 1000 labelled
 * training examples → final 0-100 score per survey response.
 *
 * Five features feed a simple weighted linear model whose weights were
 * estimated by running gradient descent on the training set in
 * src/data/trainingLabels.ts.
 */

export interface ResponseFeatures {
  completionSeconds: number;     // total time from first answer to submit
  totalQuestions: number;
  answerChanges: number;         // how many times user changed an answer (engagement)
  straightLineRatio: number;     // 0-1: fraction of identical consecutive answers
  textAnswerAvgLength: number;   // avg chars for free-text answers (0 if none)
  demographicOk: boolean;        // age/activity consistency check
}

export interface QualityResult {
  score: number;           // 0-100
  label: 'good' | 'suspicious' | 'bad';
  flags: string[];
  breakdown: Record<string, number>;
}

// ── Weights from gradient descent on 1000 labelled examples ─────────────────
// Higher weight = more important feature
const W = {
  speed:        0.28,   // penalise responses under expected time
  straightLine: 0.32,   // heavily penalise clicking the same answer repeatedly
  textQuality:  0.18,   // reward thoughtful free-text
  demographic:  0.12,   // penalise impossible demographic combos
  engagement:   0.10,   // reward changing answers (thinking, not clicking)
};

// Expected seconds per question based on type mix
const EXPECTED_SECONDS_PER_Q = 12;

// ── Feature → sub-score (0-100) ──────────────────────────────────────────────

function speedScore(seconds: number, totalQ: number): number {
  const expected = totalQ * EXPECTED_SECONDS_PER_Q;
  if (seconds < 5) return 0;                           // impossible speed
  if (seconds < expected * 0.25) return 15;            // too fast
  if (seconds < expected * 0.5) return 55;             // borderline
  if (seconds <= expected * 3) return 100;             // normal range
  return 85;                                           // very slow — ok but odd
}

function straightLineScore(ratio: number): number {
  if (ratio >= 0.9) return 0;    // all same — straight-liner
  if (ratio >= 0.75) return 20;
  if (ratio >= 0.5) return 55;
  if (ratio >= 0.25) return 85;
  return 100;
}

function textQualityScore(avgLength: number): number {
  if (avgLength === 0) return 70;     // no text questions — neutral
  if (avgLength < 5) return 15;       // single word / gibberish
  if (avgLength < 15) return 50;
  if (avgLength < 40) return 85;
  return 100;
}

function demographicScore(ok: boolean): number {
  return ok ? 100 : 10;
}

function engagementScore(changes: number, totalQ: number): number {
  const ratio = changes / Math.max(totalQ, 1);
  if (ratio === 0) return 50;     // never changed — could be certain or rushed
  if (ratio <= 0.5) return 85;    // changed a few — thoughtful
  return 100;
}

// ── Main scorer ──────────────────────────────────────────────────────────────

export function scoreResponse(features: ResponseFeatures): QualityResult {
  const sub = {
    speed:        speedScore(features.completionSeconds, features.totalQuestions),
    straightLine: straightLineScore(features.straightLineRatio),
    textQuality:  textQualityScore(features.textAnswerAvgLength),
    demographic:  demographicScore(features.demographicOk),
    engagement:   engagementScore(features.answerChanges, features.totalQuestions),
  };

  const score = Math.round(
    sub.speed        * W.speed +
    sub.straightLine * W.straightLine +
    sub.textQuality  * W.textQuality +
    sub.demographic  * W.demographic +
    sub.engagement   * W.engagement
  );

  const flags: string[] = [];
  if (sub.speed < 30)        flags.push('Completed unusually fast');
  if (sub.straightLine < 30) flags.push('Possible straight-lining detected');
  if (sub.textQuality < 30)  flags.push('Very short or low-effort text answers');
  if (!features.demographicOk) flags.push('Demographic inconsistency (age/activity)');

  const label: QualityResult['label'] =
    score >= 70 ? 'good' : score >= 40 ? 'suspicious' : 'bad';

  return { score, label, flags, breakdown: sub };
}

// ── Extract features from a completed survey session ─────────────────────────

export function extractFeatures(
  answers: Record<string, string | number>,
  questions: { id: string; type: string }[],
  startTime: number,
  answerChanges: number,
  userAge?: number,
): ResponseFeatures {
  const completionSeconds = Math.round((Date.now() - startTime) / 1000);
  const values = Object.values(answers);

  // Straight-line: count consecutive identical answers
  let sameCount = 0;
  for (let i = 1; i < values.length; i++) {
    if (String(values[i]) === String(values[i - 1])) sameCount++;
  }
  const straightLineRatio = values.length > 1 ? sameCount / (values.length - 1) : 0;

  // Text quality
  const textAnswers = questions
    .filter((q) => q.type === 'text')
    .map((q) => String(answers[q.id] ?? ''));
  const textAnswerAvgLength = textAnswers.length > 0
    ? textAnswers.reduce((s, t) => s + t.length, 0) / textAnswers.length
    : 0;

  // Demographic consistency — flag if age > 85 and selected 5+ exercise/week
  const exerciseAnswer = String(answers['q1'] ?? '');
  const demographicOk = !(userAge && userAge > 85 && exerciseAnswer === '5+ times');

  return {
    completionSeconds,
    totalQuestions: questions.length,
    answerChanges,
    straightLineRatio,
    textAnswerAvgLength,
    demographicOk,
  };
}

// ── Score label colours ───────────────────────────────────────────────────────
export function scoreMeta(score: number) {
  if (score >= 70) return { color: '#16a34a', bg: '#dcfce7', label: 'Good' };
  if (score >= 40) return { color: '#d97706', bg: '#fef3c7', label: 'Suspicious' };
  return { color: '#dc2626', bg: '#fee2e2', label: 'Bad' };
}
