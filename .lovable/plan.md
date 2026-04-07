

# NEIS 학생 명단 형식 지원

## 현재 문제
NEIS 엑셀 파일의 **반** 열이 숫자가 아닌 텍스트(예: "죽", "매", "난", "국")입니다. 현재 코드는 `class`를 `number`로 처리하므로 `parseInt("죽")` → `NaN`이 되어 학생이 파싱되지 않습니다.

## 변경 사항

### 1. DB 마이그레이션 — `student_class` 컬럼을 `TEXT`로 변경
- `visits` 테이블: `student_class INT` → `TEXT`
- `waiting_queue` 테이블: `student_class INT` → `TEXT`

```sql
ALTER TABLE visits ALTER COLUMN student_class TYPE TEXT;
ALTER TABLE waiting_queue ALTER COLUMN student_class TYPE TEXT;
```

### 2. `src/lib/students.ts` — `Student.class`를 `string`으로 변경
- `class: number` → `class: string`
- `getClasses()` 반환 타입을 `string[]`로 변경, 정렬을 `localeCompare`로
- `getStudentsInClass()` 파라미터 `cls: number` → `cls: string`

### 3. `src/components/admin/StudentUpload.tsx` — 파싱 로직 수정
- `parseInt(String(row[classIdx]))` 대신 `String(row[classIdx]).trim()` 사용
- `isNaN(cls)` 검증 제거, 빈 문자열 체크로 대체
- 반 정렬을 `localeCompare`로 변경

### 4. `src/pages/Kiosk.tsx` — 타입 수정
- `QueueItem.student_class: number` → `string`
- `selectedClass` state: `number` → `string`
- 초기값 `0` → `""`
- 표시 텍스트 `{c}반` 유지 (예: "죽반")

### 5. 관리 페이지 컴포넌트들 — `student_class` 타입 반영
- `AdminDashboard.tsx`, `VisitRecordModal.tsx`, `HealthJournal.tsx` 등에서 `student_class`를 `string`으로 처리

