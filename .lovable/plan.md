

## 검토: 학년·반 선택 방식 추가 계획

### 검토한 내용
- `src/components/admin/DirectVisitDialog.tsx` — 현재 구조
- `src/lib/students.ts` — `Student` 타입은 `{grade: number, class: string, number: number, name: string}`
- 호출부 `AdminDashboard.tsx` — `onSelect(student)` 콜백 시그니처

### 발견한 이슈 및 보완사항

**1. 데이터 키 이름 오류 (중요)**
이전 계획서에 `s.class_name`로 적었지만 실제 필드명은 **`s.class`**. 구현 시 반드시 `s.class`를 써야 함. (또한 `class`는 JS 예약어처럼 보이지만 객체 속성으로는 문제없음.)

**2. `getGrades()`/`getClasses()` 함수 존재 여부 미확인**
`src/lib/students.ts`에 해당 헬퍼가 없을 가능성이 높음 → 컴포넌트 안에서 `loadStudents()` 결과로부터 직접 `Set`으로 추출하면 됨. 별도 export 불필요.

**3. 반 정렬 순서**
한글 반 이름(난/매/송/죽 등)은 `localeCompare("ko")` 또는 학교가 정한 순서가 필요. 일반 `.sort()`로도 가나다순이 되지만 명시적으로 `localeCompare`를 쓰면 안전.

**4. 빈 셀 처리**
"1학년 죽반"이 없을 수도 있음. 그리드 셀이 비어있으면 비활성(disabled) 회색 버튼으로 두거나 빈칸으로. 빈 셀을 클릭 가능하게 두면 안 됨 → `disabled` 처리 필요.

**5. 상태 초기화 타이밍**
다이얼로그가 닫힐 때 `mode`, `selectedClass`, `search` 모두 초기화. 또한 학생 선택 시(`handleSelect`)에도 초기화해야 다음 열림에서 기본 탭(학년·반)으로 시작.

**6. 학생 0명인 학교(명단 미업로드) 처리**
기존 코드의 "학생 명단을 먼저 업로드해주세요" 분기는 그대로 유지. 두 탭 모두 영향받지 않음.

**7. 반응형/높이**
그리드 + 학생 리스트가 같은 다이얼로그에 들어가므로 `max-h` overflow 처리 필요. 기존 `max-h-64`는 학생 리스트에만 적용. 그리드 자체는 학년 6 × 반 N개라 작아서 문제없음.

**8. 호출부 영향 없음**
`AdminDashboard`는 `onSelect(student)`만 받음 → 시그니처 변경 없으므로 호환됨.

**9. PWA/라우팅/인증 영향 없음**
순수 UI 컴포넌트 변경이라 다른 기능에 부작용 없음.

### 결론
계획은 안전하게 적용 가능. 단, 구현 시 다음 4가지를 반드시 반영:
- 필드명은 `s.class` (이전 계획의 `s.class_name`은 오타)
- 학년·반 추출은 컴포넌트 내부에서 `Set`으로 직접 처리
- 빈 학년·반 셀은 `disabled` 처리
- 다이얼로그 닫힘/학생 선택 시 모든 상태 초기화

이 보완사항을 반영해서 구현하면 기능 오작동 없습니다.

