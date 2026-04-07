

# 빠른 입력 (F1~F8) 기능 추가

## 개요
방문 기록 모달에서 F1~F8 단축키 또는 버튼을 누르면 미리 저장한 증상/처치/투약 내용이 3개 필드에 한번에 채워지는 기능.

## 변경 사항

### 1. DB 테이블 추가: `quick_input_presets`
```sql
create table public.quick_input_presets (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null,
  slot_number int not null check (slot_number between 1 and 8),
  label text not null default '',
  health_issue text not null default '',
  treatment text not null default '',
  medication text not null default '',
  unique (teacher_id, slot_number)
);
alter table public.quick_input_presets enable row level security;
-- 본인 데이터만 CRUD
create policy "own_presets" on public.quick_input_presets
  for all to authenticated
  using (teacher_id = auth.uid())
  with check (teacher_id = auth.uid());
```

### 2. `src/components/admin/VisitRecordModal.tsx` 수정
- 모달 상단에 F1~F8 버튼 8개를 가로로 배치 (작은 칩 형태)
  - 프리셋이 설정된 버튼은 라벨 표시, 미설정은 `F1`, `F2`... 표시
  - 클릭 시 해당 프리셋의 증상/처치/투약 값을 3개 필드에 채움
- `useEffect`로 F1~F8 키보드 이벤트 리스너 등록 (모달 열릴 때만)
  - `e.preventDefault()`로 브라우저 기본 동작 차단
- 모달 내 ⚙️ 아이콘 버튼 → 프리셋 설정 다이얼로그 열림

### 3. 새 파일: `src/components/admin/QuickInputSettings.tsx`
- 별도 다이얼로그로 F1~F8 프리셋 편집 UI
- 각 슬롯마다: 라벨, 증상, 처치, 투약 입력 필드
- 저장 시 `quick_input_presets` 테이블에 upsert
- Accordion 또는 탭으로 8개 슬롯 정리

### 4. `src/components/admin/VisitRecordModal.tsx` Props 변경
- `teacherId` prop 추가 (프리셋 조회/저장용)

### 5. 프리셋 호출 시 AdminDashboard에서 teacherId 전달
- `AdminDashboard.tsx`에서 VisitRecordModal에 `teacherId` prop 전달

## 흐름
```text
모달 열림 → DB에서 해당 교사의 F1~F8 프리셋 로드
→ F3 버튼 클릭 or 키보드 F3
→ 증상/처치/투약 필드가 F3 프리셋 값으로 채워짐
→ 필요시 수정 후 저장

⚙️ 버튼 → 설정 다이얼로그
→ F1~F8 각각 라벨/증상/처치/투약 편집 → 저장
```

## 기술 상세
- DB 마이그레이션 1건 (테이블 + RLS)
- 기존 인증 시스템 활용, 추가 인증 변경 없음
- 프리셋 데이터는 교사별로 격리 (RLS)

