

# 체온 입력 필드 추가

## 개요
방문 기록 모달에 "체온" 입력 필드를 추가합니다. 프리셋(F1~F8) 적용 없이 매번 수기 입력합니다.

## 변경 사항

### 1. DB 마이그레이션 — `visits` 테이블에 `temperature` 컬럼 추가
```sql
ALTER TABLE public.visits ADD COLUMN temperature text DEFAULT NULL;
```

### 2. `src/components/admin/VisitRecordModal.tsx`
- `temperature` state 추가
- 투약 내용 아래에 체온 입력 필드 추가 (Input, placeholder: "예: 37.5")
- `onSave` 콜백에 `temperature` 포함
- visit 로드 시 temperature 초기화
- 프리셋 적용(applyPreset, F키) 시 체온은 건드리지 않음

### 3. `src/components/admin/AdminDashboard.tsx`
- `handleSaveVisit`의 data 타입에 `temperature` 추가
- update 쿼리에 `temperature` 포함
- Visit 인터페이스에 `temperature` 추가

### 4. 보건일지 엑셀 반영
- `HealthJournal.tsx`에서 체온 컬럼을 엑셀 출력에 포함

