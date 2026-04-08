

# 보건일지 수정/삭제 기능 추가

## 변경 사항

### 1. `src/components/admin/HealthJournal.tsx`

**테이블 행 클릭 시 수정**: 각 행을 클릭 가능하게 만들어 `VisitRecordModal`을 열어 수정
- 상태 추가: `selectedVisit`, `modalOpen`
- 행에 `cursor-pointer hover:bg-muted/30` + `onClick` → 해당 visit을 선택하고 모달 오픈
- `VisitRecordModal` import 및 렌더
- `onSave` 핸들러: visits 테이블 update → `fetchVisits()` 재호출

**삭제 버튼**: 테이블에 "작업" 컬럼 추가
- 각 행 오른쪽에 🗑️ 삭제 아이콘 버튼
- 클릭 시 confirm 후 `supabase.from("visits").delete().eq("id", v.id)` → `fetchVisits()`

```text
시간 | 학생 | 유형 | 건강문제 | 처치 | 투약 | 체온 | 작업
                                                      [🗑️]
```

### 2. `src/components/admin/VisitRecordModal.tsx`

- 기존 모달을 그대로 재사용 (이미 visit 데이터를 받아 폼에 채워주는 구조)
- 수정 완료 시 `onSave` 콜백으로 데이터 전달

### 흐름
1. 보건일지 테이블에서 행 클릭 → VisitRecordModal 열림 (기존 데이터 채워짐)
2. 수정 후 저장 → DB update → 목록 새로고침
3. 🗑️ 클릭 → 확인 → DB delete → 목록 새로고침

