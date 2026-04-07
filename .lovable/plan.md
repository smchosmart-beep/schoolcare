

# 보건실 이용 누적 현황 탭 추가

## 개요
관리자 페이지에 **"이용현황"** 탭을 추가하여 기간별 보건실 방문자 수를 조회할 수 있게 합니다.

## 변경 사항

### 1. 새 파일: `src/components/admin/VisitStatistics.tsx`
- 시작일/종료일 DatePicker 2개 (Shadcn Popover + Calendar)
- "조회" 버튼 클릭 시 `visits` 테이블에서 해당 기간 데이터 조회
  - `visited_at >= 시작일 00:00:00` AND `visited_at <= 종료일 23:59:59`
  - `teacher_id` 필터
- 표시 내용:
  - **총 방문 건수** (스스로 치료 + 선생님 치료 합산, 중복 방문 모두 카운트)
  - **스스로 치료 건수** / **선생님 치료 건수** 각각 표시
  - 일별 방문 건수 테이블 (날짜 | 스스로 치료 | 선생님 치료 | 합계)

### 2. `src/pages/Admin.tsx` 수정
- 탭 5개로 확장: 대시보드 / 치료항목 / 학생명단 / 보건일지 / **이용현황**
- `grid-cols-4` → `grid-cols-5`
- `BarChart3` 아이콘 사용
- `VisitStatistics` 컴포넌트 import 및 TabsContent 추가

### DB 변경
없음. 기존 `visits` 테이블 조회만 사용.

## 기술 상세
- `date-fns` 사용 (이미 설치됨)
- Shadcn Calendar/Popover 컴포넌트 사용 (이미 설치됨)
- `pointer-events-auto` 클래스 포함
- 같은 학생 중복 방문도 모두 카운트 (단순 row count)

