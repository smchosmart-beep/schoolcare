

# 보건일지 테이블 "시간" → "일시" + 요일 추가

## 변경 사항

### `src/components/admin/HealthJournal.tsx`

1. **컬럼 헤더** (251줄): `시간` → `일시`

2. **셀 내용** (269줄): `format(new Date(v.visited_at), "M/d HH:mm")` → 요일 포함 포맷
   - `date-fns/locale/ko` 사용하여 `M/d(EEE) HH:mm` → `4/8(화) 10:58`
   - `format(new Date(v.visited_at), "M/d(EEE) HH:mm", { locale: ko })`

3. **엑셀 내보내기** (89줄): `시간` 키도 `일시`로 변경, 포맷에 요일 추가

