

# 미승인 사용자 로그인 시 연락처 안내 페이지 표시

## 현재 동작
- 미승인 사용자가 로그인하면 `toast.error`로 "관리자 승인 대기 중입니다"만 표시하고 즉시 `signOut` 처리
- 사용자는 관리자 연락처를 알 수 없음

## 변경 내용

### `src/pages/Login.tsx`
- 미승인 시 `signOut` + toast 대신, **승인 대기 안내 페이지**를 로그인 폼 자리에 표시
- `useState`로 `pendingApproval` 상태 추가
- `pendingApproval === true`이면 로그인 폼 대신 안내 UI 렌더링:
  - "승인 대기 중" 제목 + 안내 문구
  - 관리자 연락처 `010-5168-3210` (tel: 링크)
  - "돌아가기" 버튼 → `pendingApproval = false`로 폼 복귀
- `signOut`은 여전히 호출 (세션 정리)

변경 파일: `src/pages/Login.tsx` 1개

