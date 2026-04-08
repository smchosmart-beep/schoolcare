

# 보건교사 직접 보건일지 작성 기능

## 개요
보건교사가 대시보드에서 학생을 검색하여 키오스크 없이 바로 방문 기록을 생성하고 보건일지를 작성할 수 있는 기능 추가.

## 변경 사항

### 1. 새 컴포넌트: `src/components/admin/DirectVisitDialog.tsx`
- 학생 검색 다이얼로그 생성
- localStorage에 저장된 학생 명단(`loadStudents()`)에서 검색
- 학년/반 드롭다운 필터 + 이름/번호 텍스트 검색
- 학생 클릭 시 `visits` 테이블에 `teacher_visit` 레코드 insert → 콜백으로 해당 Visit 객체 반환

### 2. `src/components/admin/AdminDashboard.tsx`
- "대기 명단" 섹션 헤더 옆에 **"+ 직접 기록"** 버튼 추가
- 버튼 클릭 → `DirectVisitDialog` 열림
- 학생 선택 완료 시 → 생성된 visit을 `selectedVisit`에 세팅하고 `VisitRecordModal` 오픈

```text
┌──────────────────────────────────────────┐
│ 🕐 보건선생님 대기 명단    [+ 직접 기록] │
│ ...                                      │
└──────────────────────────────────────────┘
```

### 3. DirectVisitDialog 상세 UI
```text
┌─ 학생 검색 ──────────────────────┐
│ [학년 ▼] [반 ▼] [이름/번호 검색] │
│                                   │
│  1번 김민수                       │
│  2번 이영희                       │
│  3번 박철수                       │
│  ...                              │
└───────────────────────────────────┘
```
- 학년/반 선택 시 해당 반 학생 목록 표시
- 학생 클릭 → visits insert → 모달 닫기 → VisitRecordModal 열기

### 기술 세부사항
- `loadStudents()`, `getGrades()`, `getClasses()`, `getStudentsInClass()` 활용 (src/lib/students.ts)
- 학생 명단이 비어 있으면 "학생 명단을 먼저 업로드해주세요" 안내 표시

