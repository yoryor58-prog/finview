'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import type { FinancialMetric } from '@/types';

interface Props {
  metrics: FinancialMetric[];
  fsDiv: 'CFS' | 'OFS';
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function toChartValue(v: number | null): number {
  if (v === null) return 0;
  return Math.round(v / 100_000_000); // 억원 단위
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipFormatter = (value: any) =>
  [`${Number(value).toLocaleString()}억원`, ''] as [string, string];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const donutTooltipFormatter = (v: any) =>
  [`${Number(v).toLocaleString()}억원`, ''] as [string, string];

export default function FinanceCharts({ metrics, fsDiv }: Props) {
  const filtered = metrics.filter((m) => m.fsDiv === fsDiv);
  const bsMetrics = filtered.filter((m) => m.sjDiv === 'BS');
  const isMetrics = filtered.filter((m) => m.sjDiv === 'IS');

  const bsChartData = bsMetrics
    .filter((m) => ['자산총계', '부채총계', '자본총계'].includes(m.accountName))
    .map((m) => ({
      name: m.accountName,
      당기: toChartValue(m.current),
      전기: toChartValue(m.previous),
      전전기: toChartValue(m.twoYearsAgo),
    }));

  const isChartData = isMetrics
    .filter((m) =>
      ['매출액', '영업이익', '당기순이익(손실)', '법인세차감전 순이익'].includes(m.accountName)
    )
    .map((m) => ({
      name: m.accountName === '당기순이익(손실)' ? '당기순이익' : m.accountName,
      당기: toChartValue(m.current),
      전기: toChartValue(m.previous),
      전전기: toChartValue(m.twoYearsAgo),
    }));

  const assetItems = bsMetrics.filter((m) => ['유동자산', '비유동자산'].includes(m.accountName));
  const donutData = assetItems.map((m) => ({
    name: m.accountName,
    value: Math.abs(toChartValue(m.current)),
  }));

  const structureItems = bsMetrics.filter((m) => ['부채총계', '자본총계'].includes(m.accountName));
  const structureData = structureItems.map((m) => ({
    name: m.accountName,
    value: Math.abs(toChartValue(m.current)),
  }));

  const hasBs = bsChartData.length > 0;
  const hasIs = isChartData.length > 0;

  const currentLabel = filtered[0]?.currentLabel ?? '당기';
  const previousLabel = filtered[0]?.previousLabel ?? '전기';
  const twoYearsAgoLabel = filtered[0]?.twoYearsAgoLabel ?? '';

  const legendFormatter = (value: string) => {
    if (value === '당기') return currentLabel;
    if (value === '전기') return previousLabel;
    if (value === '전전기') return twoYearsAgoLabel || '전전기';
    return value;
  };

  return (
    <div className="space-y-8">
      {hasBs && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-1">재무상태표 주요 계정 비교</h3>
          <p className="text-xs text-gray-400 mb-4">단위: 억원</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bsChartData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip formatter={tooltipFormatter} />
              <Legend formatter={legendFormatter} />
              <Bar dataKey="당기" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="전기" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              {twoYearsAgoLabel && <Bar dataKey="전전기" fill="#dbeafe" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasIs && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-1">손익계산서 주요 계정 비교</h3>
          <p className="text-xs text-gray-400 mb-4">단위: 억원</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={isChartData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v.toLocaleString()} />
              <Tooltip formatter={tooltipFormatter} />
              <Legend formatter={legendFormatter} />
              <Bar dataKey="당기" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="전기" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
              {twoYearsAgoLabel && <Bar dataKey="전전기" fill="#d1fae5" radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {donutData.length >= 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 mb-1">자산 구성</h3>
            <p className="text-xs text-gray-400 mb-4">단위: 억원</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`
                  }
                  labelLine
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={donutTooltipFormatter} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {structureData.length >= 2 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 mb-1">부채 vs 자본</h3>
            <p className="text-xs text-gray-400 mb-4">단위: 억원</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={structureData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(((percent ?? 0) as number) * 100).toFixed(0)}%`
                  }
                  labelLine
                >
                  {structureData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#ef4444' : '#3b82f6'} />
                  ))}
                </Pie>
                <Tooltip formatter={donutTooltipFormatter} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 영업이익률 추이 라인 */}
      {(() => {
        const revenue = isMetrics.find((m) => m.accountName === '매출액');
        const opProfit = isMetrics.find((m) => m.accountName === '영업이익');
        if (!revenue || !opProfit) return null;

        const trendData = [
          twoYearsAgoLabel && revenue.twoYearsAgo && opProfit.twoYearsAgo
            ? {
                name: twoYearsAgoLabel.replace('제 ', '').split(' ')[0],
                영업이익률: parseFloat(
                  ((opProfit.twoYearsAgo / revenue.twoYearsAgo) * 100).toFixed(1)
                ),
              }
            : null,
          revenue.previous && opProfit.previous
            ? {
                name: previousLabel.replace('제 ', '').split(' ')[0],
                영업이익률: parseFloat(((opProfit.previous / revenue.previous) * 100).toFixed(1)),
              }
            : null,
          revenue.current && opProfit.current
            ? {
                name: currentLabel.replace('제 ', '').split(' ')[0],
                영업이익률: parseFloat(((opProfit.current / revenue.current) * 100).toFixed(1)),
              }
            : null,
        ].filter(Boolean);

        if (trendData.length < 2) return null;

        return (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-base font-bold text-gray-800 mb-4">영업이익률 추이</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  formatter={(v) => [`${v}%`, '영업이익률'] as [string, string]}
                />
                <Line
                  type="monotone"
                  dataKey="영업이익률"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      })()}
    </div>
  );
}
