

# 더보기 드롭박스 버튼 간격 조정

## 변경 사항

### `src/components/admin/VisitRecordModal.tsx` — 131줄

현재 `+더보기` 버튼이 `ml-auto`로 오른쪽 끝에 붙어 있어 F4와의 간격이 넓음.

- `ml-auto` 제거 → F4 옆에 동일한 `gap-1.5` 간격으로 바로 붙도록 변경
- 설정(⚙️) 버튼만 `ml-auto`로 오른쪽 끝 배치
- 더보기 버튼 래퍼 `div`를 풀어서 더보기 버튼과 설정 버튼을 같은 flex 레벨로 이동

구체적으로 131줄의 `<div className="ml-auto flex items-center gap-1.5">` 래퍼를 제거하고, 더보기 버튼은 F4 옆에, 설정 버튼에만 `ml-auto`를 적용합니다.

