import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FinView - 재무데이터 분석 서비스',
  description: '회사 재무제표를 누구나 쉽게 이해할 수 있는 시각화 및 AI 분석 서비스',
  keywords: ['재무분석', '재무제표', 'DART', '주식', '기업분석'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
