
# F1~F8 버튼 고정 너비 적용

## 변경 사항

### `src/components/admin/VisitRecordModal.tsx`

4곳의 버튼 className 수정 (120줄, 182줄):

```
// 변경 전
className="h-7 px-2 text-xs"

// 변경 후
className="h-7 w-[5.5rem] px-1 text-xs"
```

`w-[5.5rem]`으로 고정 너비를 지정하여 라벨 길이에 관계없이 버튼 크기가 동일하게 유지됩니다. 기존 `truncate` 처리가 있어 긴 라벨은 자동으로 잘립니다.
