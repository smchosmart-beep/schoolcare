

# [+더보기] 프리셋 확장 기능

## 개요
F1~F8 버튼 옆에 **[+더보기]** 버튼을 추가하여, 9번 이상의 프리셋도 저장·선택할 수 있게 합니다.

## 변경 사항

### 1. DB 마이그레이션 — `slot_number` 제약 조건 완화
```sql
ALTER TABLE public.quick_input_presets DROP CONSTRAINT quick_input_presets_slot_number_check;
ALTER TABLE public.quick_input_presets ADD CONSTRAINT quick_input_presets_slot_number_check CHECK (slot_number >= 1);
```
기존 1~8 제한을 1 이상으로 변경.

### 2. `src/components/admin/VisitRecordModal.tsx`
- F1~F8 버튼 뒤에 **[+더보기]** 버튼 추가
- 클릭 시 Popover(또는 Dialog)로 **전체 프리셋 목록** 표시 (9번 이상 포함)
- 목록에서 항목 클릭 → 증상/처치/투약 3개 필드 자동 채움
- F1~F8은 기존처럼 키보드 단축키 + 버튼 유지

### 3. `src/components/admin/QuickInputSettings.tsx`
- 기존 F1~F8 고정 슬롯 아래에 **[+ 프리셋 추가]** 버튼 추가
- 9번 이상 슬롯을 동적으로 추가/삭제 가능
- DB에서 전체 프리셋 로드 (slot_number 제한 없이)
- 삭제 버튼은 9번 이상 슬롯에만 표시 (F1~F8은 고정)

### 4. 프리셋 fetch 로직 수정
- `VisitRecordModal`의 `fetchPresets`에서 전체 프리셋 로드 (8개 제한 제거)
- F1~F8 단축키는 `slot_number <= 8`인 것만 반응

## 흐름
```text
모달 열림 → 전체 프리셋 로드
→ F1~F8 버튼 | [+더보기] 버튼 | ⚙️ 설정
→ [+더보기] 클릭 → 9번 이상 프리셋 목록 팝업
→ 항목 선택 → 3개 필드 자동 채움

⚙️ 설정 → F1~F8 편집 + 추가 프리셋 동적 추가/삭제
```

