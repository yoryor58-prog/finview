'use client';

import { useState } from 'react';
import type { Corp, FinancialData, ReportCode } from '@/types';
import { REPORT_CODES } from '@/types';
import MetricCard from '@/components/MetricCard';
import FinanceCharts from '@/components/FinanceCharts';
import AiAnalysis from '@/components/AiAnalysis';

interface Props {
  corp: Corp;
}

const KEY_BS_ACCOUNTS = ['자산총계', '부채총계', '자본총계', '유동자산', '비유동자산', '이익잉여금'];
const KEY_IS_ACCOUNTS = ['매출액', '영업이익', '당기순이익(손실)', '법인세차감전 순이익'];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => String(currentYear - 1 - i));

export default function FinanceDashboard({ corp }: Props) {
  const [bsnsYear, setBsnsYear] = useState(String(currentYear - 1));
  const [reprtCode, setReprtCode] = useState<ReportCode>('11011');
  const [fsDiv, setFsDiv] = useState<'CFS' | 'OFS'>('CFS');
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await window.fetch(
        `/api/finance/single-account?corpCode=${corp.corpCode}&bsnsYear=${bsnsYear}&reprtCode=${reprtCode}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? '데이터 조회 실패');
      setData(json.data);
      // 연결재무제표가 있으면 CFS, 없으면 OFS
      const hasCfs = json.data.metrics.some((m: { fsDiv: string }) => m.fsDiv === 'CFS');
      setFsDiv(hasCfs ? 'CFS' : 'OFS');
    } catch (e) {
      setError(e instanceof Error ? e.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  };

  const keyMetrics = data
    ? data.metrics.filter(
        (m) =>
          m.fsDiv === fsDiv &&
          (KEY_BS_ACCOUNTS.includes(m.accountName) || KEY_IS_ACCOUNTS.includes(m.accountName))
      )
    : [];

  const hasCfs = data?.metrics.some((m) => m.fsDiv === 'CFS') ?? false;
  const hasOfs = data?.metrics.some((m) => m.fsDiv === 'OFS') ?? false;

  return (
    <div className="space-y-6">
      {/* 회사 정보 헤더 */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{corp.corpName}</h2>
            <p className="text-sm text-gray-400">{corp.corpEngName}</p>
            <div className="flex gap-2 mt-1">
              {corp.stockCode && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono">
                  {corp.stockCode}
                </span>
              )}
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">
                {corp.corpCode}
              </span>
            </div>
          </div>

          {/* 조회 옵션 */}
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">사업연도</label>
              <select
                value={bsnsYear}
                onChange={(e) => setBsnsYear(e.target.value)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 bg-gray-50"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">보고서 종류</label>
              <select
                value={reprtCode}
                onChange={(e) => setReprtCode(e.target.value as ReportCode)}
                className="text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 bg-gray-50"
              >
                {Object.entries(REPORT_CODES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetch}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              조회
            </button>
          </div>
        </div>
      </div>

      {/* 오류 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-red-500 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-red-700">데이터 조회 실패</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* 결과 */}
      {data && (
        <>
          {/* 연결/별도 토글 */}
          {hasCfs && hasOfs && (
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1 w-fit">
              {(['CFS', 'OFS'] as const).map((div) => (
                <button
                  key={div}
                  onClick={() => setFsDiv(div)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    fsDiv === div ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
                  }`}
                >
                  {div === 'CFS' ? '연결재무제표' : '별도재무제표'}
                </button>
              ))}
            </div>
          )}

          {/* 핵심 지표 카드 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {keyMetrics.map((m, i) => (
              <MetricCard key={i} metric={m} />
            ))}
          </div>

          {/* 차트 */}
          <FinanceCharts metrics={data.metrics} fsDiv={fsDiv} />

          {/* AI 분석 */}
          <AiAnalysis data={data} />
        </>
      )}
    </div>
  );
}
