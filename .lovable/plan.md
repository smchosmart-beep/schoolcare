

# 학생 명단 엑셀 다운로드 기능 추가

## 현재 상태
- 엑셀 업로드(덮어쓰기), 개별 추가, 검색/삭제 기능은 이미 구현됨
- **다운로드(백업) 기능만 없음**

## 변경 사항

### `src/components/admin/StudentUpload.tsx`
- "엑셀 파일 다운로드" 버튼 추가 (업로드 버튼 옆)
- `xlsx` 라이브러리(이미 설치됨)를 사용하여 localStorage의 현재 학생 명단을 `.xlsx` 파일로 내보내기
- 컬럼: 학년, 반, 번호, 이름
- 학년 → 반 → 번호 순으로 정렬하여 내보내기
- 파일명: `학생명단_YYYYMMDD.xlsx`

### 구현 로직
```typescript
const handleDownload = () => {
  const sorted = [...students].sort((a, b) => 
    a.grade - b.grade || a.class.localeCompare(b.class) || a.number - b.number
  );
  const wsData = [["학년", "반", "번호", "이름"], ...sorted.map(s => [s.grade, s.class, s.number, s.name])];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "학생명단");
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  XLSX.writeFile(wb, `학생명단_${today}.xlsx`);
};
```

### UI 위치
기존 "엑셀 파일 업로드" 버튼과 "명단 전체 삭제" 버튼 사이에 다운로드 버튼 배치

### 변경 파일
| 파일 | 변경 |
|------|------|
| `src/components/admin/StudentUpload.tsx` | 다운로드 버튼 + handleDownload 함수 추가 |

DB 변경 없음. 새 라이브러리 설치 없음 (`xlsx` 이미 사용 중).

