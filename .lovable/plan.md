

# 체온 표시 개선: °C 단위 + 색상 구분

## 변경 사항

### `src/components/admin/VisitRecordModal.tsx` (296줄)

체온 표시 부분을 헬퍼 함수로 교체:

- `°C` 단위 추가
- 색상 분기:
  - `< 37`: 녹색 (`text-green-600`)
  - `>= 37, < 38`: 노란색 (`text-yellow-600`)
  - `>= 38`: 빨간색 (`text-red-600`)
- 체온 값이 없으면 기존처럼 `-` 표시

```tsx
const getTempDisplay = (temp: string | null) => {
  if (!temp) return <span className="text-muted-foreground">-</span>;
  const n = parseFloat(temp);
  const color = isNaN(n) ? "text-muted-foreground"
    : n >= 38 ? "text-red-600"
    : n >= 37 ? "text-yellow-600"
    : "text-green-600";
  return <span className={`font-medium ${color}`}>{temp}°C</span>;
};
```

296줄의 `<span className="text-muted-foreground">{h.temperature || "-"}</span>` → `{getTempDisplay(h.temperature)}`

