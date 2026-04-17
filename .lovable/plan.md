

## 한글 반 이름 정렬 순서 사용자 지정 기능

현재 한글 반 이름(난/매/송/죽 등)은 가나다순으로 자동 정렬됩니다. 학교에서 정한 순서(예: 송·죽·난·매)와 다를 수 있어, 보건교사가 직접 순서를 바꿀 수 있게 합니다.

### 구현 방안

**1. 반 순서 저장소** (`src/lib/students.ts`)
- `localStorage` 키 `health-journal-class-order`에 반 이름 배열 저장
- `loadClassOrder()`, `saveClassOrder(order: string[])` 함수 추가
- `sortClasses(classes: string[])` 헬퍼: 저장된 순서 우선, 나머지는 가나다순

**2. 관리 UI** — `src/components/admin/StudentUpload.tsx`의 "저장된 학생 명단" 섹션 위에 새 카드 추가
- 학생 명단에서 추출한 모든 반 목록을 카드 형태로 나열
- **위/아래 화살표 버튼**으로 순서 조정 (드래그 없이 단순/안정적)
- "기본(가나다)순으로 초기화" 버튼
- 변경 즉시 `localStorage` 저장 + toast 안내

**3. 정렬 적용 위치**
- `DirectVisitDialog.tsx` 그리드의 행 순서 (`classes` 정렬)
- `StudentUpload.tsx` 요약 카드의 반 칩 정렬
- 기존 `localeCompare("ko")`를 모두 새 `sortClasses()`로 교체

### UI 예시 (반 순서 카드)

```text
┌─ 반 순서 설정 ──────────────────┐
│  [↑][↓] 송반                    │
│  [↑][↓] 죽반                    │
│  [↑][↓] 난반                    │
│  [↑][↓] 매반                    │
│  [기본(가나다)순으로 초기화]     │
└────────────────────────────────┘
```

### 영향 범위 / 안전성
- 신규 localStorage 키만 추가 → 기존 데이터 무관
- `sortClasses()`가 저장값 없을 때는 가나다순 fallback → 기존 동작 보존
- 학생 명단 변경/업로드 후에도 카드의 반 목록은 `students`에서 자동 재계산

