import type { Corp } from '@/types';
import corpsData from '@/data/corps.json';

const corps: Corp[] = corpsData as Corp[];

export function searchCorps(query: string, limit = 20): Corp[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.trim().toLowerCase();
  const results: Corp[] = [];

  // 회사명 또는 영문명 또는 종목코드로 검색
  for (const corp of corps) {
    if (
      corp.corpName.toLowerCase().includes(q) ||
      corp.corpEngName.toLowerCase().includes(q) ||
      corp.stockCode.startsWith(q) ||
      corp.corpCode.startsWith(q)
    ) {
      results.push(corp);
      if (results.length >= limit) break;
    }
  }

  // 정렬: 회사명이 query로 시작하는 것 우선
  return results.sort((a, b) => {
    const aStarts = a.corpName.toLowerCase().startsWith(q) ? 0 : 1;
    const bStarts = b.corpName.toLowerCase().startsWith(q) ? 0 : 1;
    return aStarts - bStarts;
  });
}

export function getCorpByCode(corpCode: string): Corp | undefined {
  return corps.find((c) => c.corpCode === corpCode);
}

export function getTotalCount(): number {
  return corps.length;
}
