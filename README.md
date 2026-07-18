# 스쿨케어 (SchoolCare)

키오스크 연동형 스마트 보건일지 시스템

초등학교 보건실에서 보건교사와 학생이 함께 사용하는 디지털 보건일지입니다. 학생은 키오스크 화면에서 간편하게 방문을 등록하고, 보건교사는 관리자 화면에서 대기열을 관리하고 진료 기록을 작성합니다.

---

## 🚀 주요 기능

### 키오스크 모드 (`/kiosk`)
- 학생이 직접 학년 → 반 → 이름을 선택하여 보건실 방문 등록
- **스스로 치료**: 미리 설정된 항목(반창고, 얼음찜질 등)을 선택하여 간단 처치 기록
- **보건선생님 만나기**: 대기열에 등록하고 진료 순서를 기다림
- PWA 지원: 태블릿/모바일 홈 화면에 설치하여 키오스크처럼 사용

### 보건교사 관리 (`/admin`)
- **대기열 관리**: 키오스크에서 등록한 학생들의 대기 목록을 실시간 확인
- **직접 기록**: 이름 검색 또는 학년·반 선택으로 학생을 찾아 진료 기록 작성
- **보건일지**: 일별 방문 기록 조회, 수정, 삭제 및 엑셀 다운로드
- **이용 현황**: 주별/월별/연도별 방문 통계와 엑셀 리포트
- **학생 명단 관리**: NEIS 엑셀 업로드, 개별 추가·삭제, 반 순서 설정, 백업 다운로드
- **사용자 관리**: 교사 계정 승인/거절, 관리자 역할 부여, 사용 기간 설정

### 보안 및 운영
- **관리자 승인제 회원가입**: 신규 교사는 관리자가 승인해야 서비스 이용 가능
- **사용 기간 관리**: 관리자가 계정별 사용 만료일을 설정하고, 만료 시 연장 요청 안내
- **학생 이름 DB 암호화**: Postgres `pgcrypto`를 활용한 PGP 대칭 암호화로 개인정보 보호
- **Row Level Security (RLS)**: Supabase 데이터베이스 레벨에서 사용자별 데이터 접근 제어

---

## 🛠 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 18, TypeScript 5, Vite 5 |
| 스타일 | Tailwind CSS, shadcn/ui |
| 상태 및 데이터 | TanStack Query, React Router DOM |
| 백엔드 | Lovable Cloud (Supabase) — Auth, Postgres, Realtime, RLS |
| 모바일 | Capacitor (iOS/Android native wrapper) |
| 테스트 | Vitest, Playwright |
| 엑셀 | xlsx |

---

## 📁 프로젝트 구조

```
.
├── src/
│   ├── pages/              # 라우트 페이지
│   │   ├── Index.tsx        # 루트: 인증 상태에 따라 /admin 또는 /login 이동
│   │   ├── Login.tsx        # 로그인 + 승인 대기 안내
│   │   ├── Signup.tsx       # 회원가입
│   │   ├── Admin.tsx        # 보건교사 관리 대시보드
│   │   ├── Kiosk.tsx        # 학생용 키오스크
│   │   └── NotFound.tsx
│   ├── components/admin/    # 관리자용 컴포넌트
│   │   ├── AdminDashboard.tsx
│   │   ├── HealthJournal.tsx
│   │   ├── VisitStatistics.tsx
│   │   ├── StudentUpload.tsx
│   │   ├── UserManagement.tsx
│   │   ├── DirectVisitDialog.tsx
│   │   └── VisitRecordModal.tsx
│   ├── hooks/               # React hooks
│   │   └── useAuth.tsx      # 인증, 승인, 역할, 만료 상태 관리
│   ├── lib/                 # 유틸리티
│   │   └── students.ts      # localStorage 기반 학생 명단 관리
│   ├── integrations/supabase/
│   │   ├── client.ts        # Supabase 클라이언트
│   │   └── types.ts         # DB 타입
│   └── assets/              # 이미지, 아이콘
├── supabase/migrations/      # DB 스키마, RLS, 트리거, 함수
├── capacitor.config.ts      # Capacitor native app 설정
├── index.html               # PWA manifest, 메타 태그
└── README.md
```

---

## ⚙️ 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test
```

개발 서버는 기본적으로 `http://localhost:8080`에서 실행됩니다.

---

## 🔐 환경 변수

Lovable Cloud 프로젝트에서는 아래 변수가 자동으로 관리됩니다.

| 변수 | 설명 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase 프로젝트 ID |

직접 `.env`를 수정할 필요는 없습니다.

---

## 📦 배포

- **프론트엔드**: Lovable 에디터 상단의 **Publish → Update** 버튼으로 배포합니다.
- **백엔드**: `supabase/migrations/`에 추가된 마이그레이션은 Lovable Cloud에 자동 적용됩니다.
- **네이티브 앱**: Capacitor 설정을 통해 iOS/Android 빌드가 가능합니다.

---

## 📌 주요 라우트

| 경로 | 설명 | 접근 권한 |
|------|------|----------|
| `/` | 루트 페이지, 로그인/관리자로 리다이렉트 | 누구나 |
| `/login` | 로그인 | 누구나 |
| `/signup` | 회원가입 | 누구나 |
| `/admin` | 보건교사 관리 대시보드 | 로그인 + 승인된 사용자 |
| `/kiosk` | 학생용 키오스크 | 로그인 + 승인된 사용자 |

---

## 📄 라이선스

Private project — 외부 공개 및 무단 사용을 금합니다.
