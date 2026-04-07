

# "더보기" → "빠른 입력 추가" + 순번 #1~#9 + Alt 단축키

## 변경 사항

### `src/components/admin/VisitRecordModal.tsx`

**1. 버튼 텍스트 (135줄)**
- `+더보기` → `빠른 입력 추가`

**2. 팝오버 내 순번 표시 (140~154줄)**
- 현재: `#${preset.slot_number}` (9, 10, 11...)
- 변경: `.map((preset, index)` → `#${index + 1}` 표시, 각 항목에 `Alt+${index+1}` 힌트 추가
- 최대 9개까지만 표시 (slot_number > 8인 프리셋을 최대 9개로 slice)

**3. Alt+1~Alt+9 키보드 단축키 (64~82줄)**
- 기존 F1~F8 핸들러에 Alt 키 감지 추가:
  ```
  if (e.altKey && e.key >= '1' && e.key <= '9') {
    const extraPresets = presets.filter(p => p.slot_number > 8);
    const idx = parseInt(e.key) - 1;
    if (extraPresets[idx]) applyPreset(extraPresets[idx].slot_number);
  }
  ```

**4. 프리셋 개수 제한**
- QuickInputSettings에서도 최대 17개(F1~F8 + 추가 9개)까지만 추가 가능하도록 제한 확인

