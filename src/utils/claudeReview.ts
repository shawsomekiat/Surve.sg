/**
 * Claude API — Response Quality Review (Option 3)
 *
 * Used to enrich edge-case labels and give surveyors a human-readable
 * explanation of why a response was flagged.
 *
 * Set VITE_ANTHROPIC_API_KEY in your .env file.
 * For production, proxy this through your own backend to keep the key secret.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { QualityResult } from './qualityScorer';

export interface ClaudeReview {
  verdict: 'approve' | 'reject' | 'review';
  reasoning: string;
  confidence: number;   // 0-100
}

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY ?? '',
      dangerouslyAllowBrowser: true,
    });
  }
  return _client;
}

export async function reviewWithClaude(
  surveyTitle: string,
  answers: Record<string, string | number>,
  questions: { id: string; text: string; type: string }[],
  ruleBasedResult: QualityResult,
): Promise<ClaudeReview> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Return a deterministic mock when no API key is configured
    return mockReview(ruleBasedResult);
  }

  const answersText = questions
    .map((q) => `Q: ${q.text}\nA: ${answers[q.id] ?? '(no answer)'}`)
    .join('\n\n');

  const prompt = `You are a survey response quality auditor for SurveSG, a Singapore survey platform.

Survey: "${surveyTitle}"
Rule-based quality score: ${ruleBasedResult.score}/100 (${ruleBasedResult.label})
Flags raised: ${ruleBasedResult.flags.length > 0 ? ruleBasedResult.flags.join(', ') : 'none'}

Respondent's answers:
${answersText}

Assess the quality of this response. Consider:
1. Are the answers internally consistent and logical?
2. Do free-text answers show genuine thought?
3. Is there any sign of random clicking or bot behaviour?
4. Is the response useful for genuine market research?

Reply in this exact JSON format (no markdown):
{"verdict":"approve|reject|review","reasoning":"one sentence explanation","confidence":0-100}`;

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const parsed = JSON.parse(text) as ClaudeReview;
    return parsed;
  } catch {
    return mockReview(ruleBasedResult);
  }
}

function mockReview(result: QualityResult): ClaudeReview {
  if (result.label === 'good') {
    return { verdict: 'approve', reasoning: 'Responses are consistent and show genuine engagement.', confidence: 88 };
  }
  if (result.label === 'bad') {
    return { verdict: 'reject', reasoning: 'Pattern indicates automated or low-effort submission.', confidence: 91 };
  }
  return { verdict: 'review', reasoning: 'One or more answers appear borderline — manual review recommended.', confidence: 62 };
}
