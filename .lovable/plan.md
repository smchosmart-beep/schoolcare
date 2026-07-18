# README.md 작성 계획

## 프로젝트 개요
스쿨케어(SchoolCare)는 초등학교 보건실을 위한 키오스크 연동형 스마트 보건일지 시스템입니다. 보건교사의 관리(Admin) 화면과 학생들이 직접 사용하는 키오스크(Kiosk) 화면으로 구성되어 있습니다.

## README에 포함할 내용

### 1. 소개 (Introduction)
- 서비스명: 스쿨케어 (SchoolCare)
- 설명: 키오스크 연동형 스마트 보건일지 시스템
- 대상: 초등학교 보건교사 및 학생

### 2. 핵심 기능
- **키오스크 모드**: 학생이 학년→반→이름을 선택하여 보건선생님 만나기 또는 스스로 치료 기록
- **보건교사 관리**: 대기열 관리, 직접 진료 기록, 보건일지 조회/엑셀 다운로드
- **이용 현황 통계**: 월별/주별/일별 방문 통계 및 엑셀 다운로드
- **학생 명단 관리**: NEIS 엑셀 업로드, 개별 추가/삭제, 반 순서 설정, 백업 다운로드
- **사용자 관리**: 관리자 승인제 회원가입, 역할(교사/관리자), 사용 기간 설정
- **학생 이름 DB 암호화**: PGP 대칭 암호화로 개인정보 보호

### 3. 기술 스택
- 프론트엔드: React 18, TypeScript 5, Vite 5, Tailwind CSS, shadcn/ui
- 상태/데이터: TanStack Query, React Router
- 백엔드: Lovable Cloud (Supabase) — 인증, Postgres DB, Row Level Security
- 모바일: Capacitor (iOS/Android native app wrapper)
- 테스트: Vitest, Playwright

### 4. 설치 및 실행
- 개발 서버: `npm install` → `npm run dev`
- 빌드: `npm run build`
- 테스트: `npm test`

### 5. 프로젝트 구조
- `src/pages/`: 라우트 페이지 (Login, Signup, Admin, Kiosk, Index)
- `src/components/admin/`: 관리자용 컴포넌트
- `src/hooks/`: 인증 훅 등
- `src/lib/`: 유틸리티 (학생 명단 localStorage 관리)
- `supabase/migrations/`: DB 스키마 및 정책

### 6. 환경 변수
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (Lovable Cloud 자동 관리)

### 7. 배포
- Lovable 플랫폼에서 Publish/Update 버튼으로 프론트엔드 배포
- 백엔드 마이그레이션은 자동 적용

### 8. 라이선스
- Private project

## 변경 파일
- `README.md` (신규 작성)

## 변경 없음
- 소스 코드, DB 마이그레이션, 의존성 추가 없음