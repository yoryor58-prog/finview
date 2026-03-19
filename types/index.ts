// 회사 마스터 데이터
export interface Corp {
  corpCode: string;
  corpName: string;
  corpEngName: string;
  stockCode: string;
  modifyDate: string;
}

// OpenDART 단일회사 주요계정 응답 항목
export interface DartAccountItem {
  rcept_no: string;
  bsns_year: string;
  corp_code: string;
  stock_code: string;
  reprt_code: string;
  fs_div: 'CFS' | 'OFS';
  fs_nm: string;
  sj_div: 'BS' | 'IS';
  sj_nm: string;
  account_nm: string;
  thstrm_nm: string;
  thstrm_dt: string;
  thstrm_amount: string;
  thstrm_add_amount: string;
  frmtrm_nm: string;
  frmtrm_dt: string;
  frmtrm_amount: string;
  frmtrm_add_amount: string;
  bfefrmtrm_nm?: string;
  bfefrmtrm_dt?: string;
  bfefrmtrm_amount?: string;
  ord: string;
  currency: string;
}

export interface DartApiResponse {
  status: string;
  message: string;
  list?: DartAccountItem[];
}

// 정규화된 재무 지표
export interface FinancialMetric {
  accountName: string;
  fsDiv: 'CFS' | 'OFS';
  sjDiv: 'BS' | 'IS';
  current: number | null;
  previous: number | null;
  twoYearsAgo: number | null;
  currentLabel: string;
  previousLabel: string;
  twoYearsAgoLabel: string;
  currency: string;
}

export interface FinancialData {
  corpCode: string;
  corpName: string;
  bsnsYear: string;
  reprtCode: string;
  metrics: FinancialMetric[];
}

// 보고서 코드
export const REPORT_CODES = {
  '11011': '사업보고서',
  '11012': '반기보고서',
  '11013': '1분기보고서',
  '11014': '3분기보고서',
} as const;

export type ReportCode = keyof typeof REPORT_CODES;

// Gemini 분석 결과
export interface AiAnalysisResult {
  summary: string;
  keyChanges: string;
  risks: string;
  glossary: string;
  disclaimer: string;
}
