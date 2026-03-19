# FinView - 재무데이터 시각화/AI분석 서비스

DART 전자공시 API 기반으로 상장/비상장 기업의 재무제표를 시각화하고 Gemini AI가 쉽게 해설해주는 웹 서비스입니다.

## 기능

- **회사 검색**: 3,864개 기업 데이터를 회사명/종목코드로 자동완성 검색
- **재무 시각화**: OpenDART 실데이터 기반 막대/도넛/라인 차트 및 핵심 지표 카드
- **AI 해설**: Gemini AI가 재무 초보자도 이해할 수 있게 쉽게 분석

## 로컬 실행

```bash
# 1. 의존성 설치
npm install

# 2. corp.xml 파싱 (최초 1회)
npm run parse-corps

# 3. 환경변수 설정 (.env.local)
OPENDART_API_KEY=발급받은_API키
GEMINI_API_KEY=발급받은_API키

# 4. 개발 서버 실행
npm run dev
```

## corp.xml 업데이트

[DART 공시정보 다운로드](https://opendart.fss.or.kr/api/corpCode.xml?crtfc_key=YOUR_KEY) 또는 오픈DART에서 새 corp.xml을 다운로드 후:

```bash
# 프로젝트 루트에 corp.xml 복사 후
npm run parse-corps
```

## Vercel 배포

1. [Vercel](https://vercel.com)에서 GitHub 리포지토리 연결
2. 프로젝트 환경변수 추가:
   - `OPENDART_API_KEY`: OpenDART API 인증키
   - `GEMINI_API_KEY`: Google Gemini API 키
3. Build Command: `node scripts/parse-corps.mjs && next build`

> **주의**: `corp.xml` 파일이 프로젝트 루트에 있어야 합니다. Vercel 빌드 시 리포지토리에 corp.xml을 포함하거나 빌드 스텝에서 다운로드하도록 설정하세요.

## 기술 스택

- **프레임워크**: Next.js 16 (App Router)
- **언어**: TypeScript
- **스타일**: Tailwind CSS
- **차트**: Recharts
- **AI**: Google Gemini (`@google/generative-ai`)
- **XML 파싱**: fast-xml-parser
- **배포**: Vercel

## API 키 보안 원칙

- 모든 외부 API 호출은 서버 API 라우트(`/api/*`)에서만 실행
- 클라이언트 번들에 API 키 포함 없음
- `.env*` 파일은 `.gitignore`로 Git에서 제외
- `data/corps.json`도 `.gitignore`에 포함 (빌드 시 생성)

## 데이터 출처

- 기업 정보: [DART 고유번호](https://opendart.fss.or.kr) (corp.xml)
- 재무 데이터: [OpenDART API](https://opendart.fss.or.kr/api/fnlttSinglAcnt.json) - 단일회사 주요계정
