

# 로그인 멈춤 수정 계획 — 부작용 검토 결과

## 핵심 문제 발견: `await` 제거 시 만료 안내 페이지가 잠깐 보이는 플래시 현상

### 원인

`onAuthStateChange`에서 `await`를 제거하면:
1. `setLoading(false)`가 `checkApprovalAndRole` 완료 **전에** 호출됨
2. 이 시점에서 `approved = null`, `isAdmin = false`, `expiresAt = null`
3. `expired` 계산: `!isAdmin(false) && (!expiresAt(null))` → **`true`**
4. Admin.tsx 48행: `if (expired && !isAdmin)` → **ExpiredNotice가 잠깐 렌더링됨**
5. Kiosk.tsx 207행: `if (expired)` → **마찬가지로 만료 안내가 잠깐 표시됨**

→ 프로필 조회가 끝나면 정상 화면으로 전환되지만, 사용자에게 "만료됨" 페이지가 **깜빡** 보이는 UX 문제 발생.

### 해결 방법

`await` 제거와 함께, **프로필 로딩 완료 여부**를 별도로 추적해야 함:

```text
loading = true   → 세션 복원 중 (스피너)
approved = null  → 프로필 아직 미확인 (스피너 유지)
approved = true/false + expiresAt 세팅 완료 → 최종 판단
```

## 수정 계획 (보완된 버전)

### 1. `src/hooks/useAuth.tsx`
- `onAuthStateChange` 콜백에서 `async/await` 제거 (데드락 해결)
- `setLoading(false)`는 **`checkApprovalAndRole` 완료 후**에만 호출
- `onAuthStateChange`에서: 세션 있으면 `checkApprovalAndRole().then(() => setLoading(false))`, 세션 없으면 즉시 `setLoading(false)`
- `SIGNED_OUT` 이벤트에서도 즉시 `setLoading(false)`

구체적 변경:
```tsx
supabase.auth.onAuthStateChange((event, session) => {
  setSession(session);
  setUser(session?.user ?? null);

  if (session?.user && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
    checkApprovalAndRole(session.user.id).then(() => setLoading(false));
  } else {
    if (event === "SIGNED_OUT") {
      setApproved(null);
      setIsAdmin(false);
      setExpiresAt(null);
    }
    setLoading(false);
  }
});
```

### 2. 다른 파일 변경 없음
- Admin.tsx, Kiosk.tsx, Login.tsx: `loading`이 `true`인 동안 스피너가 표시되므로, 프로필 로딩 완료 전에 만료 판단이 실행되지 않음
- 기존 코드 그대로 유지

## 최종 판단

| 항목 | 결과 |
|------|------|
| 데드락 해결 | `await` 제거로 해결 |
| 만료 페이지 플래시 | `setLoading(false)`를 프로필 조회 완료 후로 이동하여 방지 |
| DB 호출 | 변경 없음 |
| 기존 기능 영향 | 없음 — `getSession`의 `then` 블록도 동일 패턴 유지 |

변경 파일: `src/hooks/useAuth.tsx` 1개만 수정

