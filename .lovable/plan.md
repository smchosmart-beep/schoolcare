# 지난 날짜 보건일지 기록 기능

## 목표
어제 등 과거에 방문한 학생의 기록을 오늘 작성할 수 있도록, 방문 일시를 직접 지정/수정할 수 있게 한다.

## 현재 상태 (코드 확인 완료)
- `AdminDashboard.handleDirectVisit`: 직접 기록 생성 시 `visited_at`을 지정하지 않아 DB 기본값(현재 시각)으로 저장됨.
- `VisitRecordModal`: 헤더에 방문 시간을 읽기 전용 텍스트로만 표시하고, 저장 시 `visited_at`을 업데이트하지 않음.

## 만들 것: 기록 작성 창에서 방문 일시 편집

### 1. `src/components/admin/VisitRecordModal.tsx`
- 헤더의 "방문 시간" 읽기 전용 표시를 **날짜+시간 입력 필드**(`input type="datetime-local"`)로 교체.
- 모달이 열릴 때 기존 `visited_at` 값으로 초기화. 신규 기록은 현재 시각이 기본값이므로 평소 사용은 그대로.
- 저장 시 `onSave` 데이터에 `visitedAt`을 포함해 전달.

### 2. onSave 호출부 모두 수정 (모달 공유)
`VisitRecordModal`은 `AdminDashboard`·`HealthJournal` 두 곳에서 공유되므로 두 호출부 모두 변경.

- `onSave` 타입에 `visitedAt: string` 추가.
- `src/components/admin/AdminDashboard.tsx` `handleSaveVisit`: `visited_at: data.visitedAt`을 UPDATE에 추가 (camelCase → `visited_at` 명시 매핑).
- `src/components/admin/HealthJournal.tsx` `handleSave`: 동일하게 `visited_at` 추가. 기존 `...data` spread는 camelCase라 컬럼에 안 들어가므로, spread 후 `updateData.visited_at = data.visitedAt` 명시 할당 또는 spread 대상에서 visitedAt 제외 후 별도 매핑.
- 대시보드는 "오늘" 기준으로만 목록을 불러오므로, 과거 날짜로 저장한 기록은 대시보드에서 빠지고 **보건일지(해당 날짜 이동 시)·방문기록 탭**에서 확인됨. 저장 완료 토스트에 "방문기록 탭에서 확인할 수 있습니다" 안내 문구 추가.

## 사용 흐름 예시
1. 대시보드 "직접 기록" → 학생 선택 → 기록 작성 창이 열림
2. 방문 일시를 어제 날짜로 변경 → 증상·처치 입력 → 저장
3. 방문기록 탭(학년도 전체 기간 조회)에서 어제 날짜로 확인 가능

## 기술 사항
- 스키마 변경 없음. 기존 `Teachers can update their own visits` 정책으로 `visited_at` UPDATE 가능.
- `datetime-local` 입력값을 `new Date(...).toISOString()`으로 변환해 저장 (로컬 시간대 유지).
- 키오스크(학생용) 화면은 변경하지 않음 — 학생이 날짜를 조작할 수 없도록 현재 시각 자동 기록 유지.
