

# 주별 엑셀 다운로드 오류 수정

## 원인
엑셀 시트 이름에 `/` 문자를 사용할 수 없음. 현재 시트 이름이 `월(4/7)` 형식인데 `/`가 금지 문자.

## 수정
`src/components/admin/HealthJournal.tsx` 116줄:

```typescript
// 변경 전
const sheetName = `${dayNames[i]}(${format(day, "M/d")})`;

// 변경 후
const sheetName = `${dayNames[i]}(${format(day, "M-d")})`;
```

`/`를 `-`로 변경하여 `월(4-7)` 형식으로 출력.

