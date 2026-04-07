

# 키오스크 모드 "관리자 페이지에서 시작해주세요" 문제 수정

## 원인
Lovable 미리보기 환경에서 `window.open`으로 새 탭을 열면 **다른 origin**으로 열릴 수 있어서 `localStorage`가 공유되지 않습니다. Admin에서 `localStorage.setItem("kiosk-teacher-id", user.id)`를 설정해도 Kiosk 탭에서 읽을 수 없습니다.

## 해결 방안
`window.open` 대신 **URL 파라미터**로 `teacherId`를 전달합니다. Kiosk 페이지에서 URL에 `teacherId`가 있으면 그 값을 사용하고, 없으면 `localStorage` fallback.

### 변경 파일

**1. `src/pages/Admin.tsx`** — `handleKioskMode` 수정
```typescript
const handleKioskMode = () => {
  if (user) {
    localStorage.setItem("kiosk-teacher-id", user.id);
    window.open(`/kiosk?teacher=${user.id}`, "kiosk-window");
  }
};
```

**2. `src/pages/Kiosk.tsx`** — URL 파라미터에서 teacherId 읽기
```typescript
// URL 파라미터 우선, localStorage fallback
const params = new URLSearchParams(window.location.search);
const teacherParam = params.get("teacher");
if (teacherParam) {
  localStorage.setItem("kiosk-teacher-id", teacherParam);
}
const teacherId = localStorage.getItem("kiosk-teacher-id") || "";
```

이렇게 하면 새 탭이 열릴 때 URL에 teacher ID가 포함되어 localStorage 공유 문제를 우회합니다.

