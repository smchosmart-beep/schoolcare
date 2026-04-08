

# 이용현황 기간 설정 간격 개선

## 변경 사항

### `src/components/admin/VisitStatistics.tsx` (90줄)

`flex` 컨테이너의 `gap-3` → `gap-4`로 늘리고, "시작일" 라벨과 버튼, `~` 기호, "종료일" 라벨과 버튼 사이에 충분한 간격 확보.

추가로 `~` 기호 좌우에 `px-2` 패딩 추가하여 시각적 여유 확보:

- 105줄: `<span className="pb-2 text-muted-foreground">~</span>` → `<span className="pb-2 px-2 text-muted-foreground">~</span>`

