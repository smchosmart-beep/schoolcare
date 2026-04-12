

# 엑셀 다운로드 열너비 통일

## 문제
`applyColumnWidths` 함수가 데이터 내용 길이에 따라 동적으로 열너비를 계산하므로, 데이터가 적은 주별/월별 시트에서는 열이 좁게 나옴.

## 해결
`applyColumnWidths` 함수를 수정하여 **고정 열너비**를 사용. 데이터 양에 관계없이 A~K열(날짜, 시간, 학년, 반, 번호, 이름, 유형, 스스로 치료 항목, 건강문제, 처치 및 조치, 투약내용, 체온, 상태)이 항상 동일한 너비로 출력되도록 변경.

## 변경 파일
`src/components/admin/HealthJournal.tsx` — `applyColumnWidths` 함수만 수정

## 변경 내용
동적 계산 로직을 제거하고 고정 열너비 배열로 교체:

```typescript
const applyColumnWidths = (ws: XLSX.WorkSheet) => {
  ws["!cols"] = [
    { wch: 12 },  // 날짜
    { wch: 8 },   // 시간
    { wch: 5 },   // 학년
    { wch: 5 },   // 반
    { wch: 5 },   // 번호
    { wch: 7 },   // 이름
    { wch: 15 },  // 유형
    { wch: 25 },  // 스스로 치료 항목
    { wch: 25 },  // 건강문제
    { wch: 65 },  // 처치 및 조치
    { wch: 30 },  // 투약내용
    { wch: 6 },   // 체온
    { wch: 8 },   // 상태
  ];
};
```

호출부의 `applyColumnWidths(ws, rows)` → `applyColumnWidths(ws)`로 변경 (2곳).

