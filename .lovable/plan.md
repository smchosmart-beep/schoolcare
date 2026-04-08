

# 학생 이름 DB 암호화 — 최종 검토 결과

## 결론: 계획은 실행 가능하며, 아래 2가지만 추가로 처리하면 문제없음

---

## 문제없는 부분 (확인 완료)

| 항목 | 이유 |
|------|------|
| 이중 암호화 방지 | 트리거의 `LIKE '-----BEGIN PGP MESSAGE-----%'` 체크로 대기열→방문 전환 시 안전 |
| Kiosk insert | `student.name`은 localStorage 평문 → 트리거가 암호화 → 정상 |
| Kiosk/Admin toast (localStorage 기반) | `student.name`, `selectedStudent.name` 등 localStorage에서 온 이름 → 평문 유지 |
| Realtime 구독 | payload 직접 사용 안 하고 `fetchData()` 재호출 → RPC로 복호화된 데이터 수신 |
| VisitStatistics | `student_name`을 조회하지 않음 (`visited_at, visit_type`만) → 변경 불필요 |
| UPDATE 트리거 | `handleSave`에서 `student_name`을 update하지 않으므로 당장은 불필요하지만, 안전을 위해 추가하는 것이 맞음 |
| 암호화 키 보안 | `SECURITY DEFINER` 함수로 보호, 일반 쿼리로 키 노출 불가 → 현재 수준에서 수용 가능 |

---

## 남은 문제 2가지

### 1. Insert 후 `.select().single()` 반환값에 암호화된 이름 (중요)

**위치**: `AdminDashboard.tsx`

- **50~62줄** (`handleDirectVisit`): insert 후 `.select().single()`로 받은 `data.student_name`은 **암호화된 PGP 문자열**. 이 `data`가 `setSelectedVisit(data)` → `VisitRecordModal` 제목에 암호문 표시
- **120~132줄** (`handleStartVisit`): 동일 문제. 다만 여기서 `item.student_name`은 RPC로 복호화된 값이므로 toast는 정상

**해결**: insert 후 반환된 `data`의 `student_name`을 원본 평문으로 덮어쓰기:
```tsx
// handleDirectVisit
if (data) {
  setSelectedVisit({ ...data, student_name: student.name });
}

// handleStartVisit  
if (data) {
  setSelectedVisit({ ...data, student_name: item.student_name }); // RPC에서 이미 복호화됨
}
```

### 2. RPC 함수의 TypeScript 반환 타입 캐스팅

RPC 호출 시 Supabase JS가 반환하는 타입이 자동 생성 `types.ts`에 의존함. RPC 함수가 추가되면 타입이 자동 생성되겠지만, 빌드 타이밍에 따라 `unknown` 또는 `Json`으로 잡힐 수 있음.

**해결**: 각 RPC 호출 지점에서 기존 `Visit`, `QueueItem` 인터페이스로 캐스팅:
```tsx
const { data } = await supabase.rpc("get_visits_decrypted", { ... });
const visits = (data || []) as Visit[];
```

---

## 변경 필요 파일 요약

| 파일 | 변경 내용 |
|------|-----------|
| DB 마이그레이션 | pgcrypto, 키 함수, 트리거(INSERT+UPDATE), 기존 데이터 암호화, RPC 함수 2개 |
| `AdminDashboard.tsx` | select → RPC, insert 후 이름 덮어쓰기 |
| `HealthJournal.tsx` | select → RPC |
| `VisitRecordModal.tsx` | fetchHistory → RPC |
| `Kiosk.tsx` | fetchQueue → RPC |
| `VisitStatistics.tsx` | 변경 불필요 |

## 최종 판단

위 2가지를 함께 처리하면 **앱 기능 오작동 없이 안전하게 암호화 적용 가능**합니다. 승인하시면 구현을 진행하겠습니다.

