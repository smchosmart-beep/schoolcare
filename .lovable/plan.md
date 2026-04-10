

# 관리자 승인제 — 계획 검토 결과

## 결론: 큰 문제 없음. 단, 3가지 주의사항 있음

---

## 문제없는 부분

| 항목 | 이유 |
|------|------|
| 서버비 과다 | profiles 테이블 조회는 로그인 시 1회, 관리자 대시보드에서 목록 조회 정도 → 거의 무시할 수준 |
| DB 호출 과다 | 승인 체크는 로그인 시 1회 SELECT, 관리자 페이지에서 목록 1회 SELECT → 기존 visits 조회보다 적음 |
| 로딩 속도 | profiles 조회는 단일 행 SELECT (PK 기반) → 1~5ms 수준, 체감 불가 |

---

## 주의사항 3가지

### 1. 기존 사용자(heero913@sen.go.kr) 초기 데이터 처리

**문제**: 트리거는 **새 회원가입**에만 작동. 이미 존재하는 `heero913@sen.go.kr` (ID: `8e764d0c-...`)과 `teacher@school.ac.kr` (ID: `076191b1-...`)에는 profiles 레코드가 자동 생성되지 않음.

**해결**: 마이그레이션에서 기존 사용자에 대한 profiles + user_roles 레코드를 INSERT하는 코드 포함 필요.

```sql
-- 기존 관리자
INSERT INTO profiles (id, email, school_name, approved)
VALUES ('8e764d0c-d2e9-448d-bf62-c14234edab93', 'heero913@sen.go.kr', '', true);

INSERT INTO user_roles (user_id, role)
VALUES ('8e764d0c-d2e9-448d-bf62-c14234edab93', 'admin');

-- 기존 teacher 계정 (미승인 상태로)
INSERT INTO profiles (id, email, school_name, approved)
VALUES ('076191b1-165b-4b57-baa1-1dc4dbb2a3bb', 'teacher@school.ac.kr', '', false);
```

→ 이미 계획에 포함되어 있으나, **두 명 모두** 처리해야 함을 명시.

### 2. useAuth에서 매 페이지 전환마다 approved 체크 시 불필요한 호출 방지

**문제**: `useAuth`에서 `onAuthStateChange` 이벤트마다 profiles를 조회하면, 토큰 갱신(약 1시간마다) 때도 DB 호출 발생.

**해결**: approved 상태를 state에 캐시하고, 최초 로그인/세션 복원 시에만 조회. `onAuthStateChange`의 `SIGNED_IN` 이벤트에서만 체크하면 충분.

```tsx
// SIGNED_IN 이벤트에서만 approved 체크
if (event === 'SIGNED_IN') {
  const { data } = await supabase.from('profiles').select('approved').eq('id', session.user.id).single();
  if (!data?.approved) { await supabase.auth.signOut(); return; }
}
```

→ 토큰 갱신(`TOKEN_REFRESHED`) 시에는 체크하지 않아 불필요한 DB 호출 방지.

### 3. 키오스크 모드와의 충돌 없음 확인

**문제 없음**: 키오스크(`/kiosk`)는 `teacher_id`를 URL 파라미터나 localStorage에서 가져오며, 이미 로그인된 세션의 `user.id`를 사용. 승인 체크는 로그인 시점에만 하므로, 키오스크 동작에 영향 없음.

---

## 최종 판단

계획대로 진행해도 **기능 오작동, 서버비, DB 호출, 로딩 속도 문제 모두 없음**. 위 3가지 주의사항만 반영하면 안전하게 구현 가능합니다. 진행할까요?

