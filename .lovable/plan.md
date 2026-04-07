

# 키오스크 학생 명단 안 보이는 문제 수정

## 원인
Admin 페이지에서 학생 명단을 localStorage에 저장하지만, 키오스크는 `window.open`으로 새 탭/창에서 열립니다. Lovable 미리보기 환경에서는 origin이 달라 **localStorage가 공유되지 않습니다.** 따라서 키오스크에서 `loadStudents()`를 호출해도 빈 배열이 반환됩니다.

## 해결 방안
키오스크 창을 열 때 Admin 페이지의 localStorage에서 학생 데이터를 **URL hash 또는 postMessage**로 전달합니다. 학생 데이터가 클 수 있으므로 `postMessage` 방식이 적합합니다.

### 변경 사항

**1. `src/pages/Admin.tsx`** — 키오스크 창 열고 학생 데이터 전송
- `window.open` 후 반환된 window 참조를 저장
- 키오스크 창이 로드되면 `postMessage`로 학생 데이터 전송
```typescript
const handleKioskMode = () => {
  if (user) {
    localStorage.setItem("kiosk-teacher-id", user.id);
    const kioskWindow = window.open(`/kiosk?teacher=${user.id}`, "kiosk-window");
    // 키오스크 창이 로드되면 학생 데이터 전송
    if (kioskWindow) {
      const sendStudents = () => {
        const students = loadStudents();
        kioskWindow.postMessage({ type: "STUDENT_DATA", students }, "*");
      };
      // 약간의 딜레이 후 전송 (창 로드 대기)
      setTimeout(sendStudents, 1500);
      setTimeout(sendStudents, 3000);
    }
  }
};
```

**2. `src/pages/Kiosk.tsx`** — `message` 이벤트로 학생 데이터 수신
- `useEffect`에서 `window.addEventListener("message", ...)` 추가
- 수신한 학생 데이터를 키오스크의 localStorage에도 저장하고 state에 반영
```typescript
useEffect(() => {
  const handler = (e: MessageEvent) => {
    if (e.data?.type === "STUDENT_DATA" && Array.isArray(e.data.students)) {
      saveStudents(e.data.students);
      setStudents(e.data.students);
    }
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}, []);
```

**3. `src/pages/Admin.tsx`** — `loadStudents` import 추가

이렇게 하면 origin이 달라도 `postMessage`로 학생 데이터가 키오스크 창에 전달되어 학년/반/이름 선택이 정상 작동합니다.

