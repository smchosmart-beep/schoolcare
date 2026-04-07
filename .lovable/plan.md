

# 키오스크 모드 새창 반복 열림 문제 수정

## 문제 원인
`Admin.tsx`의 `handleKioskMode`에서 `window.open("/kiosk", "_blank")`를 사용하여 클릭할 때마다 새 탭이 계속 생성됩니다.

## 수정 방안

### `src/pages/Admin.tsx` — `handleKioskMode` 수정
- `window.open("/kiosk", "_blank")` → `window.open("/kiosk", "kiosk-window")` (named window로 변경하여 같은 창 재사용)
- 또는 더 나은 UX: 버튼 클릭 시 `navigate("/kiosk")`로 같은 탭에서 이동하고, 관리 페이지로 돌아오는 버튼을 키오스크에 추가

### `src/pages/Kiosk.tsx` — 안내 메시지 개선
- `teacherId`가 없을 때 단순 안내 대신 로그인 페이지로 리다이렉트하거나, 관리자 페이지 링크를 제공

## 권장: named window 방식
가장 간단한 수정은 `window.open("/kiosk", "kiosk-window")`로 변경하여 동일 창을 재사용하는 것입니다. 키오스크는 태블릿에서 별도 탭으로 열리는 것이 적합하므로 `window.open` 유지하되 이름을 지정합니다.

