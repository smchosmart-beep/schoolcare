
# 스스로 치료 학생의 이전 방문 기록 표시 개선

## 문제
스스로 치료(`visit_type === 'self_treatment'`) 방문 기록은 `health_issue`와 `treatment`가 null이라 증상과 처치가 빈칸(`-`)으로 나옴. 대신 `self_treatment_item` 컬럼에 치료 항목명이 저장되어 있음.

## 변경 사항

### `src/components/admin/VisitRecordModal.tsx` (304, 308~311줄)

**증상 표시** (304줄):
- `h.health_issue || "-"` → `h.health_issue || (h.visit_type === "self_treatment" ? "스스로 치료" : "-")`

**처치 표시** (308~311줄):
- 처치 내용 결정 로직: `h.treatment || (h.visit_type === "self_treatment" ? h.self_treatment_item : null)`
- 값이 있을 때만 `└` 줄 표시

```tsx
// 304줄
<span className="ml-2 font-medium">
  {h.health_issue || (h.visit_type === "self_treatment" ? "스스로 치료" : "-")}
</span>

// 308~311줄
{(h.treatment || (h.visit_type === "self_treatment" && h.self_treatment_item)) && (
  <div className="text-muted-foreground mt-0.5 pl-1">
    └ {h.treatment || h.self_treatment_item}
  </div>
)}
```
