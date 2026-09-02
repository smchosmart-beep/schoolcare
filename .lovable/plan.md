# 이전 방문 기록이 일부만 보이는 문제

## 확인된 사실 (데이터 조회로 검증)

- 데이터는 사라지지 않았습니다. teacher@school.ac.kr 계정에 방문 기록 **14,793건**이 그대로 있습니다(2025-03-04 ~ 오늘).
- 화면의 학생(2학년 매반 9번)은 실제로 **20건**의 기록이 있는데, 모달에는 3건만 표시됩니다.
- 원인: 기록 모달(`VisitRecordModal.tsx:69`)이 서버에서 기록을 가져올 때 페이지 처리를 하지 않아, 서버가 **최신 1,000건만** 돌려줍니다. 그 1,000건 안에 이 학생의 기록은 4건뿐이고(자기 자신 제외 3건), 나머지 16건은 잘려서 오지 않습니다.
- 같은 문제가 대시보드 조회(`AdminDashboard.tsx:78-79`)와 키오스크 대기열(`Kiosk.tsx:61`)에도 잠재합니다. 보건일지(`HealthJournal.tsx`)는 하루/기간 단위라 1,000건을 넘길 가능성이 낮지만 동일하게 안전 처리합니다. 방문기록 탭은 이미 페이지 처리가 되어 있습니다.

## 해결 계획

1. **학생별 기록만 서버에서 가져오도록 변경 (근본 해결)**
   - 현재는 전체 기록을 다 받아 온 뒤 브라우저에서 해당 학생만 걸러냅니다. 이 방식이 1,000건 제한에 걸립니다.
   - 모달에서는 해당 학생(학년·반·번호)의 기록만 요청하도록 바꿔 최근 50건을 정확히 표시합니다.
   - 이를 위해 학생 기준으로 조회하는 서버 함수(`get_student_visits_decrypted`)를 추가합니다. 기존 함수·데이터는 그대로 두고 새 함수만 추가하므로 다른 화면에 영향이 없습니다.

2. **1,000건 제한 공통 대응**
   - 전체 기록을 받아야 하는 나머지 호출(대시보드, 보건일지, 키오스크 대기열)에 1,000건 단위 반복 조회를 적용해 누락을 없앱니다.

3. **확인**
   - 2학년 매반 9번 학생 모달에서 이전 방문 기록이 19건(자기 기록 제외) 표시되는지 확인합니다.

## 기술 메모

- 신규 SQL 함수: `public.get_student_visits_decrypted(p_teacher_id uuid, p_grade int, p_class text, p_number int, p_limit int default 50)` — 기존 `get_visits_decrypted`와 동일한 복호화·보안 설정(SECURITY DEFINER, search_path=public), `visited_at DESC` 정렬, `EXECUTE` 권한은 authenticated에 부여.
- 수정 파일: `src/components/admin/VisitRecordModal.tsx`(신규 RPC 사용), `src/components/admin/AdminDashboard.tsx`, `src/components/admin/HealthJournal.tsx`, `src/pages/Kiosk.tsx`(페이지 반복 조회).
- 데이터 삭제·변경은 없습니다.
