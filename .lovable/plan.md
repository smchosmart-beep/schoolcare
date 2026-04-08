

# 보건일지 "건강문제" → "증상" 변경 + 유형 자동 전환

## 변경 사항

### `src/components/admin/HealthJournal.tsx`

**1. 컬럼 헤더 (253줄)**
- `건강문제` → `증상`

**2. 엑셀 내보내기 (95줄)**
- `건강문제:` → `증상:`

**3. handleSave (152~157줄)**
- 보건교사가 증상(`health_issue`)을 입력하여 저장하면, `visit_type`도 `"teacher_visit"`으로 함께 업데이트
- 조건: `data.health_issue`가 비어있지 않고, 기존 `selectedVisit.visit_type === "self_treatment"`인 경우

```tsx
const updateData = { ...data };
if (selectedVisit.visit_type === "self_treatment" && data.health_issue.trim()) {
  updateData.visit_type = "teacher_visit";
}
await supabase.from("visits").update(updateData).eq("id", selectedVisit.id);
```

이렇게 하면 스스로 치료로 온 학생이라도 교사가 증상을 기록하면 자동으로 "선생님" 배지로 변경됩니다.

