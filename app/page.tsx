'use client';

import { useState } from 'react';
import type { Corp } from '@/types';
import SearchCompany from '@/components/SearchCompany';
import FinanceDashboard from '@/components/FinanceDashboard';

export default function Home() {
  const [selectedCorp, setSelectedCorp] = useState<Corp | null>(null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">F</span>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">FinView</span>
              <span className="text-xs text-gray-400 ml-1.5">재무데이터 분석</span>
            </div>
          </div>
          <a
            href="https://dart.fss.or.kr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-400 hover:text-blue-500 transition-colors"
          >
            데이터: DART 전자공시
          </a>
        </div>
      </header>

      {/* 히어로 */}
      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3 leading-tight">
          재무제표를{' '}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            누구나
          </span>{' '}
          이해하게
        </h1>
        <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto">
          회사명을 검색하고 실제 재무 데이터를 차트로 확인하세요. AI가 쉽게 설명해 드립니다.
        </p>

        <div className="flex justify-center">
          <SearchCompany onSelect={(corp) => setSelectedCorp(corp)} />
        </div>
      </section>

      {/* 대시보드 */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {!selectedCorp && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-400 text-lg">위에서 회사를 검색해 시작하세요</p>
            <p className="text-gray-300 text-sm mt-2">3,864개 상장/비상장 기업 데이터 제공</p>
          </div>
        )}
        {selectedCorp && <FinanceDashboard corp={selectedCorp} />}
      </section>

      {/* 푸터 */}
      <footer className="border-t border-gray-100 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
          <p>본 서비스는 DART 전자공시시스템의 공개 데이터를 활용합니다.</p>
          <p className="mt-1">투자 권유 목적이 아니며, 모든 정보는 참고용으로만 사용하세요.</p>
        </div>
      </footer>
    </main>
  );
}
