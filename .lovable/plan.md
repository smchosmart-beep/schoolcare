

## 탭 순서 변경: 이름 검색을 기본으로

### 변경 파일
`src/components/admin/DirectVisitDialog.tsx`

### 변경 내용
- `Tabs`의 `defaultValue`를 `"grid"` → `"search"`로 변경
- `TabsList` 안의 `TabsTrigger` 순서: **이름 검색 → 학년·반 선택**
- `mode` 초기값 및 `resetState`에서 초기화 값도 `"search"`로 변경

### 안전성
- 순수 UI 순서 변경, 데이터/로직 영향 없음

