'use client';

import { useState } from 'react';
import type { FinancialData, AiAnalysisResult } from '@/types';

interface Props {
  data: FinancialData;
}

export default function AiAnalysis({ data }: Props) {
  const [result, setResult] = useState<AiAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analysis/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? '분석 실패');
      setResult(json.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-6 border border-violet-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">✨</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">AI 쉬운 재무 해설</h3>
            <p className="text-xs text-gray-500">Gemini가 누구나 이해할 수 있게 분석해 드립니다</p>
          </div>
        </div>
        {!result && (
          <button
            onClick={analyze}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 disabled:opacity-50 transition-colors shadow-md"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                분석 중...
              </>
            ) : (
              <>✨ AI 분석 생성</>
            )}
          </button>
        )}
        {result && (
          <button
            onClick={analyze}
            disabled={loading}
            className="text-xs text-violet-500 hover:underline"
          >
            다시 분석
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <Section icon="📊" title="전체 요약" content={result.summary} bgColor="bg-white" />
          <Section icon="📈" title="주요 변화" content={result.keyChanges} bgColor="bg-blue-50" />
          {result.risks && (
            <Section icon="⚠️" title="주의할 점" content={result.risks} bgColor="bg-amber-50" />
          )}
          {result.glossary && (
            <Section icon="📚" title="용어 설명" content={result.glossary} bgColor="bg-green-50" />
          )}
          <p className="text-xs text-gray-400 text-center mt-3 px-4">
            ⚠️ {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  content,
  bgColor,
}: {
  icon: string;
  title: string;
  content: string;
  bgColor: string;
}) {
  return (
    <div className={`${bgColor} rounded-xl p-4 border border-gray-100`}>
      <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
        <span>{icon}</span> {title}
      </h4>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>
    </div>
  );
}
