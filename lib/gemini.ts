import Groq from 'groq-sdk';
import type { FinancialData, AiAnalysisResult } from '@/types';
import { formatAmount } from '@/lib/format';

function buildPrompt(data: FinancialData): string {
  const cfsMetrics = data.metrics.filter((m) => m.fsDiv === 'CFS');
  const ofsMetrics = data.metrics.filter((m) => m.fsDiv === 'OFS');
  const target = cfsMetrics.length > 0 ? cfsMetrics : ofsMetrics;

  const lines = target.map((m) => {
    const curr = formatAmount(m.current, m.currency);
    const prev = formatAmount(m.previous, m.currency);
    const tya = m.twoYearsAgoLabel
      ? `전전기(${m.twoYearsAgoLabel}): ${formatAmount(m.twoYearsAgo, m.currency)}, `
      : '';
    return `- ${m.accountName}: 당기(${m.currentLabel}): ${curr}, 전기(${m.previousLabel}): ${prev}, ${tya}`;
  });

  return `당신은 재무 분석 전문가입니다. 아래 ${data.corpName} (${data.bsnsYear}년도) 재무 데이터를 바탕으로, 주식 투자나 재무를 전혀 모르는 일반인도 쉽게 이해할 수 있는 방식으로 분석해 주세요.

[재무 데이터]
${lines.join('\n')}

다음 JSON 형식으로만 응답하세요 (코드블록 없이 순수 JSON):
{
  "summary": "전체적인 재무 상태를 3~4문장으로 쉽게 요약",
  "keyChanges": "전년도 대비 가장 중요한 변화 2~3가지를 구체적인 숫자와 함께 설명",
  "risks": "주의 깊게 봐야 할 점이나 리스크 1~2가지 (있는 경우만)",
  "glossary": "이 분석에서 사용된 어려운 재무 용어 2~3개를 일상 언어로 설명",
  "disclaimer": "이 분석은 투자 권유가 아니며 참고용으로만 사용하세요."
}

주의사항:
- 투자 권유나 특정 주식 매수/매도를 절대 권유하지 마세요
- 확정적 표현("반드시", "무조건" 등) 금지
- 모든 숫자는 원문 데이터 기반으로만 작성
- 한국어로 작성`.trim();
}

const GROQ_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

export async function analyzeFinancials(data: FinancialData): Promise<AiAnalysisResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY 환경변수가 설정되지 않았습니다.');

  const groq = new Groq({ apiKey });
  const prompt = buildPrompt(data);
  const modelErrors: string[] = [];

  for (const model of GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      });

      const text = completion.choices[0]?.message?.content?.trim() ?? '';
      const jsonStr = text.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();

      try {
        const parsed = JSON.parse(jsonStr);
        return {
          summary: parsed.summary ?? '',
          keyChanges: parsed.keyChanges ?? '',
          risks: parsed.risks ?? '',
          glossary: parsed.glossary ?? '',
          disclaimer: parsed.disclaimer ?? '이 분석은 투자 권유가 아니며 참고용으로만 사용하세요.',
        };
      } catch {
        return {
          summary: text,
          keyChanges: '',
          risks: '',
          glossary: '',
          disclaimer: '이 분석은 투자 권유가 아니며 참고용으로만 사용하세요.',
        };
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      modelErrors.push(`[${model}] ${errMsg.slice(0, 300)}`);
      const isRetryable = errMsg.includes('429') || errMsg.includes('503') || errMsg.toLowerCase().includes('rate limit');
      if (!isRetryable) throw err;
    }
  }

  throw new Error(`AI 분석 실패:\n${modelErrors.join('\n')}`);
}
