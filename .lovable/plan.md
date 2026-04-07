

# 더보기 팝오버 너비를 버튼 너비와 동일하게

## 변경 사항

### `src/components/admin/VisitRecordModal.tsx` — 138줄

PopoverContent의 고정 너비 `w-64`를 제거하고, 트리거 버튼 너비에 맞추도록 변경:

- `Popover`에 `modal={false}` 추가 (이미 있을 수 있음)
- `PopoverContent`의 `className`에서 `w-64` 제거
- CSS 변수 `--radix-popover-trigger-width`를 활용하여 `w-[var(--radix-popover-trigger-width)]` 적용

```tsx
// 변경 전
<PopoverContent className="w-64 p-2 pointer-events-auto" align="end">

// 변경 후
<PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 pointer-events-auto" align="start">
```

이렇게 하면 Radix가 자동으로 트리거 버튼의 너비를 CSS 변수로 전달하여, 팝오버가 버튼과 동일한 가로 너비로 열립니다.

