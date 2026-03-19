'use client';

import { formatAmount, calcGrowthRate } from '@/lib/format';
import type { FinancialMetric } from '@/types';

interface Props {
  metric: FinancialMetric;
}

export default function MetricCard({ metric }: Props) {
  const growth = calcGrowthRate(metric.current, metric.previous);
  const isPositive = growth !== null && growth > 0;
  const isNegative = growth !== null && growth < 0;

  // 부채는 증가가 나쁨
  const isDebtItem = metric.accountName.includes('부채');
  const positiveClass = isDebtItem ? 'text-red-500' : 'text-emerald-500';
  const negativeClass = isDebtItem ? 'text-emerald-500' : 'text-red-500';

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{metric.accountName}</p>
        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
          {metric.fsDiv === 'CFS' ? '연결' : '별도'}
        </span>
      </div>

      <p className="text-2xl font-bold text-gray-900 leading-tight">
        {formatAmount(metric.current, metric.currency)}
      </p>

      <div className="flex items-center gap-2 mt-auto">
        {growth !== null && (
          <span className={`text-sm font-semibold ${isPositive ? positiveClass : isNegative ? negativeClass : 'text-gray-400'}`}>
            {isPositive ? '▲' : isNegative ? '▼' : '—'}
            {' '}{Math.abs(growth).toFixed(1)}%
          </span>
        )}
        <span className="text-xs text-gray-400">
          전기: {formatAmount(metric.previous, metric.currency)}
        </span>
      </div>
    </div>
  );
}
