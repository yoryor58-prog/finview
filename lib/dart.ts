import type { DartApiResponse, FinancialMetric, FinancialData } from '@/types';
export { formatAmount, calcGrowthRate } from '@/lib/format';

const DART_BASE_URL = 'https://opendart.fss.or.kr/api';

function parseAmount(value: string | undefined | null): number | null {
  if (!value || value === '-' || value === '') return null;
  const cleaned = value.replace(/,/g, '').trim();
  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}

// 메모리 캐시 (서버 인스턴스 수명 동안 유지)
const cache = new Map<string, { data: FinancialData; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10분

export async function fetchSingleAccount(
  corpCode: string,
  bsnsYear: string,
  reprtCode: string,
  corpName: string
): Promise<FinancialData> {
  const cacheKey = `${corpCode}:${bsnsYear}:${reprtCode}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const apiKey = process.env.OPENDART_API_KEY;
  if (!apiKey) throw new Error('OPENDART_API_KEY 환경변수가 설정되지 않았습니다.');

  const url = new URL(`${DART_BASE_URL}/fnlttSinglAcnt.json`);
  url.searchParams.set('crtfc_key', apiKey);
  url.searchParams.set('corp_code', corpCode);
  url.searchParams.set('bsns_year', bsnsYear);
  url.searchParams.set('reprt_code', reprtCode);

  const res = await fetch(url.toString(), {
    next: { revalidate: 600 },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) {
    throw new Error(`OpenDART API 요청 실패: HTTP ${res.status}`);
  }

  const json: DartApiResponse = await res.json();

  if (json.status === '013') throw new Error('조회된 데이터가 없습니다. 해당 연도/보고서를 확인하세요.');
  if (json.status === '020') throw new Error('OpenDART API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.');
  if (json.status !== '000') throw new Error(`OpenDART 오류 (${json.status}): ${json.message}`);
  if (!json.list || json.list.length === 0) throw new Error('재무 데이터가 없습니다.');

  const metrics: FinancialMetric[] = json.list.map((item) => ({
    accountName: item.account_nm,
    fsDiv: item.fs_div,
    sjDiv: item.sj_div,
    current: parseAmount(item.thstrm_amount),
    previous: parseAmount(item.frmtrm_amount),
    twoYearsAgo: parseAmount(item.bfefrmtrm_amount),
    currentLabel: item.thstrm_nm,
    previousLabel: item.frmtrm_nm,
    twoYearsAgoLabel: item.bfefrmtrm_nm ?? '',
    currency: item.currency,
  }));

  const data: FinancialData = {
    corpCode,
    corpName,
    bsnsYear,
    reprtCode,
    metrics,
  };

  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

