

# 월별 엑셀 다운로드 시 주차별 시트 분리

## 변경 파일
`src/components/admin/HealthJournal.tsx` — `handleExport` 함수의 monthly 분기 추가

## 변경 내용
현재 monthly 모드는 `else` 분기에서 단일 시트로 내보내고 있음. 이를 weekly처럼 주차별 시트로 분리.

- `date-fns`에서 `getWeekOfMonth`를 import 추가
- `viewMode === "monthly"` 전용 분기 추가:
  - 해당 월의 시작일~종료일을 구함
  - 월요일 기준으로 1주차~5주차(해당 시) 그룹핑
  - 각 주차별로 `1주차`, `2주차`, `3주차`, `4주차`, (필요시 `5주차`) 시트 생성
  - 각 시트에 해당 주차 방문 기록만 포함, 없으면 빈 행 표시
  - `applyColumnWidths` 적용
- 파일명: `보건일지_월간_yyyy년MM월.xlsx`

### 주차 계산 로직
월 시작일부터 월요일 기준으로 주차를 나눔:
```typescript
// 월의 첫 번째 월요일 기준으로 주차 그룹 생성
const monthStart = startOfMonth(currentDate);
const monthEnd = endOfMonth(currentDate);
// 1주차: 1일~첫째주 일요일, 2주차: 다음 월~일, ...
```

각 visit의 `visited_at`이 어느 주에 속하는지 판단하여 시트 분배.

