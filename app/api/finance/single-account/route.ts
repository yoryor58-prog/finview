import { NextRequest, NextResponse } from 'next/server';
import { fetchSingleAccount } from '@/lib/dart';
import { getCorpByCode } from '@/lib/corps';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const corpCode = params.get('corpCode') ?? '';
  const bsnsYear = params.get('bsnsYear') ?? '';
  const reprtCode = params.get('reprtCode') ?? '11011';

  if (!corpCode || !bsnsYear) {
    return NextResponse.json({ error: 'corpCode, bsnsYear 파라미터가 필요합니다.' }, { status: 400 });
  }

  const corp = getCorpByCode(corpCode);
  const corpName = corp?.corpName ?? corpCode;

  try {
    const data = await fetchSingleAccount(corpCode, bsnsYear, reprtCode, corpName);
    return NextResponse.json({ data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
