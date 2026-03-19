// 클라이언트/서버 모두 사용 가능한 순수 유틸리티

export function formatAmount(value: number | null, currency = 'KRW'): string {
  if (value === null) return '-';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (currency === 'KRW') {
    if (abs >= 1_000_000_000_000) {
      return `${sign}${(abs / 1_000_000_000_000).toFixed(1)}조원`;
    }
    if (abs >= 100_000_000) {
      return `${sign}${(abs / 100_000_000).toFixed(0)}억원`;
    }
    return `${sign}${abs.toLocaleString()}원`;
  }
  return `${sign}${abs.toLocaleString()} ${currency}`;
}

export function calcGrowthRate(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
