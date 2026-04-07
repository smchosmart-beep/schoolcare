

# 주별 보건일지 엑셀 다운로드 — 요일별 시트 분리

## 현재 상태
- `handleExport`가 모든 데이터를 "보건일지"라는 단일 시트에 저장
- 주별 모드일 때도 한 시트에 모든 요일이 섞여 있음

## 변경 사항

### `src/components/admin/HealthJournal.tsx` — `handleExport` 수정

주별(`viewMode === "weekly"`) 모드일 때만 동작 변경:

1. `visits` 배열을 요일별로 그룹핑 (월~금, 5개)
2. 각 요일별로 별도 시트 생성
   - 시트 이름: `월(4/7)`, `화(4/8)`, `수(4/9)`, `목(4/10)`, `금(4/11)` 형식
3. 해당 요일에 데이터가 없으면 빈 시트 또는 "기록 없음" 표시
4. 일별/월별 모드에서는 기존 단일 시트 방식 유지

### 구현 로직
```typescript
if (viewMode === "weekly") {
  const { start } = getDateRange();
  const dayNames = ["월", "화", "수", "목", "금"];
  
  for (let i = 0; i < 5; i++) {
    const day = addDays(start, i); // 월~금 (ko locale 기준 월요일 시작)
    const dayVisits = visits.filter(v => 
      isSameDay(new Date(v.visited_at), day)
    );
    const sheetName = `${dayNames[i]}(${format(day, "M/d")})`;
    // 시트 생성 후 워크북에 추가
  }
}
```

### 추가 import
- `date-fns`에서 `addDays`, `isSameDay` 추가

### 파일명
- `보건일지_주간_20260406-20260410.xlsx` 형식

