

# 보건일지 테이블 유형/건강문제/처치 표시 개선

## 변경 사항

### `src/components/admin/HealthJournal.tsx`

**1. 유형 컬럼 (284줄)**
- 현재: 스스로 치료 시 `v.self_treatment_item || "스스로"` 표시 → 항목명이 유형에 들어감
- 변경: `"선생님"` 또는 `"스스로"` 두 가지만 표시

**2. 건강문제 컬럼 (287줄)**
- 현재: `v.health_issue || "-"` → 스스로 치료도 `-` 표시 (정상, 유지)

**3. 처치 컬럼 (288줄)**
- 현재: `v.treatment || "-"` → 스스로 치료 시 `-`로 나옴
- 변경: `v.treatment || (v.visit_type === "self_treatment" ? v.self_treatment_item : null) || "-"`
  - 스스로 치료 시 `self_treatment_item` 값(예: "물파스 바르기")을 처치에 표시

**4. 엑셀 내보내기 (93~96줄)**
- 유형: 이미 `"스스로 치료"` / `"보건선생님"` → `"스스로"` / `"선생님"`으로 통일
- 처치: `v.treatment || (v.visit_type === "self_treatment" ? v.self_treatment_item : "") || ""`

