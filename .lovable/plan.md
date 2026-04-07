

# 주별 엑셀 요일 매칭 오류 수정

## 원인
`startOfWeek(currentDate, { locale: ko })`의 주 시작일이 **일요일**이므로:
- i=0 → 일요일인데 "월" 라벨
- i=1 → 월요일인데 "화" 라벨
- i=2 → 화요일인데 "수" 라벨 ← **4/7(화) 데이터가 수요일 탭에 들어감**

## 수정

### `src/components/admin/HealthJournal.tsx`

**44줄** — `startOfWeek`, `endOfWeek`에 `weekStartsOn: 1` 명시:
```typescript
// 변경 전
return { start: startOfWeek(currentDate, { locale: ko }), end: endOfWeek(currentDate, { locale: ko }) };

// 변경 후
return { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) };
```

이렇게 하면 주 시작일이 **월요일**이 되어 dayNames 배열과 정확히 매칭됩니다.

