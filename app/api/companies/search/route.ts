import { NextRequest, NextResponse } from 'next/server';
import { searchCorps } from '@/lib/corps';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? '';
  if (q.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }
  const results = searchCorps(q.trim(), 20);
  return NextResponse.json({ results });
}
