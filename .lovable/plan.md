
# 이용현황 날짜 필터 간격 문제 재수정

## 원인
현재 `src/components/admin/VisitStatistics.tsx`를 보면 라벨/버튼 감싸는 박스가 아직 `space-y-2`만 적용된 상태입니다.

```tsx
<div className="space-y-2">
  <label className="text-sm text-muted-foreground">시작일</label>
  <Popover>...</Popover>
</div>
```

이 구조에서는:
- `space-y-2` 변화가 작아서 체감이 거의 없을 수 있고
- 기본 `label`이 block이 아니라서 시각적으로 더 붙어 보일 수 있습니다.

## 수정 계획

### `src/components/admin/VisitStatistics.tsx`
기간 설정 영역의 시작일/종료일 입력 블록을 아래처럼 조정합니다.

1. 라벨을 `Label` 컴포넌트로 통일하거나, 최소한 `block` 표시 적용
2. 감싸는 박스의 간격을 더 확실하게 늘림
   - `space-y-2` → `space-y-3`
3. 필요하면 버튼에 약간의 위쪽 여백 추가
   - 예: 버튼에 `mt-1` 또는 래퍼에 `pt-0.5`

## 적용 형태
예상 구조:

```tsx
<div className="space-y-3">
  <Label className="text-sm text-muted-foreground">시작일</Label>
  <Popover>...</Popover>
</div>
```

종료일도 동일하게 맞춰서 두 필터가 같은 리듬으로 보이게 합니다.

## 기대 결과
- "시작일"/"종료일" 텍스트와 달력 버튼이 명확히 분리되어 보임
- 현재처럼 라벨이 버튼에 붙어 보이는 답답한 느낌 해소
- 기존 가로 정렬 구조는 유지하면서 세로 간격만 개선

## 기술 메모
- 수정 파일: `src/components/admin/VisitStatistics.tsx`
- 우선순위 높은 방법: `space-y-3` + `Label` 또는 `block` 라벨
- 필요 시 보조 조정: 날짜 버튼에 `mt-1`
