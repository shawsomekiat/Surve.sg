import type { Question } from '../data/surveys';

export interface SurveyResponse {
  id: string;
  timestamp: string;
  qualityScore: number;
  qualityLabel: 'good' | 'suspicious' | 'bad';
  answers: Record<string, string | number>;
}

/** Save a completed response to localStorage */
export function saveResponse(
  surveyId: string,
  answers: Record<string, string | number>,
  qualityScore: number,
  qualityLabel: 'good' | 'suspicious' | 'bad',
) {
  const key = 'survesg_responses';
  const stored: Record<string, SurveyResponse[]> = JSON.parse(localStorage.getItem(key) || '{}');
  const entry: SurveyResponse = {
    id: Date.now().toString(),
    timestamp: new Date().toLocaleString('en-SG'),
    qualityScore,
    qualityLabel,
    answers,
  };
  stored[surveyId] = [entry, ...(stored[surveyId] ?? [])];
  localStorage.setItem(key, JSON.stringify(stored));
}

/** Load all responses for a survey */
export function loadResponses(surveyId: string): SurveyResponse[] {
  const stored: Record<string, SurveyResponse[]> = JSON.parse(
    localStorage.getItem('survesg_responses') || '{}',
  );
  return stored[surveyId] ?? [];
}

/** Download responses as a CSV file */
export function exportCSV(surveyTitle: string, questions: Question[], responses: SurveyResponse[]) {
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const headers = [
    'Respondent #',
    'Timestamp',
    'Quality Score',
    'Quality Label',
    ...questions.map((q) => q.text),
  ];

  const rows = responses.map((r, i) => [
    i + 1,
    r.timestamp,
    r.qualityScore,
    r.qualityLabel,
    ...questions.map((q) => r.answers[q.id] ?? ''),
  ]);

  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${surveyTitle.replace(/[^a-z0-9]/gi, '_')}_results.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
