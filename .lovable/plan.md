
# 엑셀 F/G/H열 너비 조정

## 변경 사항

### `src/components/admin/HealthJournal.tsx` — `applyColumnWidths` 수정

현재 자동 계산 로직에 **최소 너비 오버라이드**를 추가합니다.

```typescript
const applyColumnWidths = (ws: XLSX.WorkSheet, rows: Record<string, any>[]) => {
  if (rows.length === 0) return;
  const colWidths = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(key.length * 2, ...rows.map((r) => String(r[key]).length * 1.5)),
  }));
  // F열(이름)=7, G열(유형)=15, H열(스스로 치료 항목)=25
  if (colWidths[5]) colWidths[5].wch = Math.max(colWidths[5].wch, 7);
  if (colWidths[6]) colWidths[6].wch = Math.max(colWidths[6].wch, 15);
  if (colWidths[7]) colWidths[7].wch = Math.max(colWidths[7].wch, 25);
  ws["!cols"] = colWidths;
};
```

자동 계산 값과 지정 최소값 중 큰 값을 사용하므로, 데이터가 길면 자동으로 더 넓어지고 짧으면 최소 너비가 보장됩니다.
