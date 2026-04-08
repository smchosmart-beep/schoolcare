

# 학생 개별 추가/삭제 기능 — 검토 결과

## 결론: 문제없이 구현 가능. 단, 1가지 주의사항 있음

---

## 문제없는 부분

| 항목 | 이유 |
|------|------|
| addStudent 중복 체크 | 학년+반+번호로 중복 확인 → 동일 학생 이중 등록 방지 가능 |
| removeStudent | 배열 filter 후 saveStudents → localStorage 정상 반영 |
| 엑셀 업로드와의 공존 | 엑셀은 덮어쓰기, 개별 추가/삭제는 기존 배열 수정 → 서로 독립적 |
| DB 영향 | 학생 명단은 localStorage만 사용, DB 변경 없음 |
| 암호화와의 관계 | 암호화는 visits/waiting_queue의 student_name 대상, 학생 명단과 무관 |

---

## 주의사항: Kiosk 페이지의 학생 목록 동기화

**문제**: `Kiosk.tsx` 51줄에서 `useEffect(() => setStudents(loadStudents()), [])` — 마운트 시 1회만 로드

**영향**: 관리자가 학생을 추가/삭제한 후, 이미 열려 있는 키오스크 탭에는 변경이 반영되지 않음 (새로고침 필요)

**해결**: 키오스크 화면이 `home` 스텝으로 돌아올 때마다 학생 목록을 다시 로드하도록 수정

```tsx
// Kiosk.tsx
useEffect(() => {
  if (step === "home") {
    setStudents(loadStudents());
  }
}, [step]);
```

이 한 줄 변경만 추가하면 키오스크에서도 항상 최신 학생 명단이 반영됩니다.

---

## 변경 파일 요약

| 파일 | 변경 내용 |
|------|-----------|
| `src/lib/students.ts` | `addStudent()`, `removeStudent()` 함수 추가 |
| `src/components/admin/StudentUpload.tsx` | 개별 추가 폼 + 검색/삭제 목록 UI |
| `src/pages/Kiosk.tsx` | step 변경 시 학생 목록 재로드 (1줄) |

