import { NextRequest, NextResponse } from 'next/server';
import { analyzeFinancials } from '@/lib/gemini';
import type { FinancialData } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  let data: FinancialData;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: '요청 데이터가 올바르지 않습니다.' }, { status: 400 });
  }

  if (!data?.corpCode || !data?.metrics) {
    return NextResponse.json({ error: '재무 데이터가 올바르지 않습니다.' }, { status: 400 });
  }

  try {
    const result = await analyzeFinancials(data);
    return NextResponse.json({ result });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
