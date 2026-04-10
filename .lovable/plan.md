

# 사용 기간 관리 기능 구현 (키오스크 차단 포함)

## DB 변경
- `profiles` 테이블에 `expires_at date DEFAULT NULL` 컬럼 추가
- 기존 admin 계정(heero913)은 expires_at 불필요 (admin 제외 처리)

## 코드 변경

### 1. `src/hooks/useAuth.tsx`
- `checkApprovalAndRole`에서 `expires_at`도 함께 조회
- `expired` 상태 계산: `!isAdmin && (!expiresAt || expiresAt < today)`
- 날짜 비교는 `new Date().toLocaleDateString('en-CA')` (YYYY-MM-DD 문자열) 사용하여 시간대 이슈 방지
- context에 `expired: boolean` 노출

### 2. `src/pages/Login.tsx`
- `approved && expired` → 로그아웃하지 않고 진입 허용 (안내 페이지는 Admin/Kiosk에서 처리)

### 3. `src/pages/Admin.tsx`
- `expired && !isAdmin`이면 만료 안내 페이지 렌더링: "관리자에게 사용 기간 연장을 요청하세요" + 로그아웃 버튼
- 관리자는 정상 대시보드 표시

### 4. `src/pages/Kiosk.tsx`
- `expired` 체크 추가: 만료 시 만료 안내 페이지 렌더링 (Admin과 동일 메시지) + 로그아웃 버튼
- 키오스크 URL 직접 접속해도 차단됨

### 5. `src/components/admin/UserManagement.tsx`
- 승인된 사용자 목록에 만료일 표시 컬럼 추가
- 날짜 입력 UI (date input)로 만료일 설정/변경 가능
- 만료된 사용자는 "만료됨" 빨간 배지 표시

## 흐름 요약

```text
신규 가입 → approved=false, expires_at=NULL → 로그인 차단 (미승인)
관리자 승인 → approved=true, expires_at=NULL → 로그인 가능하지만 만료 상태
관리자가 만료일 설정 → expires_at=2027-03-31 → 정상 사용
만료일 경과 → Admin/Kiosk 모두 "연장 요청" 안내만 표시
관리자가 연장 → 다시 정상 사용
```

## 변경 파일

| 파일 | 변경 |
|------|------|
| DB 마이그레이션 | `expires_at date` 컬럼 추가 |
| `src/hooks/useAuth.tsx` | `expired` 상태 추가, admin 제외 |
| `src/pages/Login.tsx` | 만료 시 로그아웃 방지 |
| `src/pages/Admin.tsx` | 만료 안내 페이지 |
| `src/pages/Kiosk.tsx` | 만료 체크 + 안내 페이지 |
| `src/components/admin/UserManagement.tsx` | 만료일 설정 UI |

