

# VisitRecordModal에 삭제 버튼 추가

## 변경 사항

### `src/components/admin/VisitRecordModal.tsx`

**Props 추가** (25~31줄):
- `onDelete?: (visitId: string) => void` 옵셔널 콜백 추가

**DialogFooter 수정** (245~252줄):
- [취소] [저장] → [취소] [저장] [삭제] 배치
- 삭제 버튼은 `variant="destructive"`, `onDelete` 있을 때만 표시
- 클릭 시 confirm 후 `onDelete(visit.id)` 호출

```tsx
<DialogFooter className="flex justify-between">
  <Button variant="destructive" onClick={() => {
    if (confirm("이 기록을 삭제하시겠습니까?") && visit) onDelete?.(visit.id);
  }}>삭제</Button>
  <div className="flex gap-2">
    <Button variant="outline" onClick={onClose}>취소</Button>
    <Button onClick={...}>저장</Button>
  </div>
</DialogFooter>
```

### `src/components/admin/AdminDashboard.tsx`

- `VisitRecordModal`에 `onDelete` prop 전달
- 삭제 시 visits에서 delete + 목록 새로고침 + 모달 닫기

### `src/components/admin/HealthJournal.tsx`

- 이미 VisitRecordModal 사용 중이면 동일하게 `onDelete` prop 전달

