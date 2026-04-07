

# 키오스크 인증 + 학생 명단 업로드 기능 추가

## 변경 파일

### 1. `src/pages/Kiosk.tsx`
- `useAuth()` 훅 추가, 미로그인 시 `/login`으로 리다이렉트
- `teacherId`를 `user.id`에서 가져옴 (URL 파라미터/localStorage 로직 제거)
- `postMessage` 리스너 제거 (47~57줄)
- 학생 명단이 비어있으면 `StudentUpload` 컴포넌트 표시 + "학생 명단을 먼저 업로드해주세요" 안내
- 홈 화면 헤더에 작은 "관리자 페이지" 버튼 추가 (보건교사가 같은 기기에서 전환 가능)
- 학생 업로드 완료 후 students state 갱신되도록 콜백 처리

### 2. `src/pages/Admin.tsx`
- `handleKioskMode`에서 `window.open`, `postMessage`, `loadStudents` 관련 코드 제거
- `navigate("/kiosk")`로 단순 이동

### 3. `src/components/admin/StudentUpload.tsx`
- 업로드 완료 시 외부에 알릴 수 있도록 `onUploadComplete?: () => void` prop 추가 (키오스크에서 사용)

