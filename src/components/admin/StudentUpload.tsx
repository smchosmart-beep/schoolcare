import { useState, useRef } from "react";
import { loadStudents, saveStudents, addStudent, removeStudent, sortClasses, loadClassOrder, saveClassOrder, clearClassOrder, type Student } from "@/lib/students";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Download, FileSpreadsheet, Trash2, Users, Plus, Search, X, ArrowUp, ArrowDown, ListOrdered } from "lucide-react";
import * as XLSX from "xlsx";

interface StudentUploadProps {
  onUploadComplete?: () => void;
}

export default function StudentUpload({ onUploadComplete }: StudentUploadProps = {}) {
  const [students, setStudents] = useState<Student[]>(loadStudents());
  const fileRef = useRef<HTMLInputElement>(null);

  // 개별 추가 폼 상태
  const [newGrade, setNewGrade] = useState("");
  const [newClass, setNewClass] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newName, setNewName] = useState("");

  // 검색
  const [searchQuery, setSearchQuery] = useState("");

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const header = rows[0]?.map((h: any) => String(h).trim()) || [];
        let gradeIdx = header.findIndex((h) => h.includes("학년"));
        let classIdx = header.findIndex((h) => h.includes("반"));
        let numberIdx = header.findIndex((h) => h.includes("번호") || h.includes("번"));
        let nameIdx = header.findIndex((h) => h.includes("이름") || h.includes("성명"));

        if (gradeIdx < 0) gradeIdx = 0;
        if (classIdx < 0) classIdx = 1;
        if (numberIdx < 0) numberIdx = 2;
        if (nameIdx < 0) nameIdx = 3;

        const parsed: Student[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[nameIdx]) continue;
          const grade = parseInt(String(row[gradeIdx]));
          const cls = String(row[classIdx]).trim();
          const num = parseInt(String(row[numberIdx]));
          const name = String(row[nameIdx]).trim();
          if (!isNaN(grade) && cls && !isNaN(num) && name) {
            parsed.push({ grade, class: cls, number: num, name });
          }
        }

        if (parsed.length === 0) {
          toast.error("학생 데이터를 찾을 수 없습니다. 엑셀 형식을 확인해주세요.");
          return;
        }

        saveStudents(parsed);
        setStudents(parsed);
        toast.success(`${parsed.length}명의 학생 명단을 저장했습니다.`);
        onUploadComplete?.();
      } catch {
        toast.error("파일을 읽는 중 오류가 발생했습니다.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClear = () => {
    saveStudents([]);
    setStudents([]);
    toast.info("학생 명단이 삭제되었습니다.");
  };

  const handleDownload = () => {
    if (students.length === 0) {
      toast.error("다운로드할 학생 명단이 없습니다.");
      return;
    }
    const sorted = [...students].sort((a, b) =>
      a.grade - b.grade || a.class.localeCompare(b.class) || a.number - b.number
    );
    const wsData = [["학년", "반", "번호", "이름"], ...sorted.map(s => [s.grade, s.class, s.number, s.name])];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "학생명단");
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    XLSX.writeFile(wb, `학생명단_${today}.xlsx`);
    toast.success("학생 명단 엑셀 파일을 다운로드했습니다.");
  };

  const handleAddStudent = () => {
    const grade = parseInt(newGrade);
    const number = parseInt(newNumber);
    const cls = newClass.trim();
    const name = newName.trim();

    if (isNaN(grade) || !cls || isNaN(number) || !name) {
      toast.error("학년, 반, 번호, 이름을 모두 입력해주세요.");
      return;
    }

    const result = addStudent({ grade, class: cls, number, name });
    if (result.success) {
      toast.success(result.message);
      setStudents(loadStudents());
      setNewGrade("");
      setNewClass("");
      setNewNumber("");
      setNewName("");
    } else {
      toast.error(result.message);
    }
  };

  const handleRemoveStudent = (student: Student) => {
    const updated = removeStudent(student.grade, student.class, student.number);
    setStudents(updated);
    toast.success(`${student.name} 학생을 삭제했습니다.`);
  };

  const grades = [...new Set(students.map((s) => s.grade))].sort((a, b) => a - b);
  const allClasses = sortClasses([...new Set(students.map((s) => s.class))]);

  const moveClass = (idx: number, dir: -1 | 1) => {
    const next = [...allClasses];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    saveClassOrder(next);
    setStudents([...students]);
    toast.success("반 순서를 변경했습니다.");
  };

  const resetClassOrder = () => {
    clearClassOrder();
    setStudents([...students]);
    toast.info("반 순서를 가나다순으로 초기화했습니다.");
  };

  const filteredStudents = searchQuery.trim()
    ? students.filter(
        (s) =>
          s.name.includes(searchQuery) ||
          `${s.grade}`.includes(searchQuery) ||
          s.class.includes(searchQuery) ||
          `${s.number}`.includes(searchQuery)
      )
    : [];

  return (
    <div className="space-y-6">
      {/* 엑셀 업로드 */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold text-foreground">NEIS 학생 명단 업로드</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          NEIS에서 내려받은 학생 명단 엑셀 파일을 업로드하세요. 데이터는 이 기기에만 저장됩니다.
        </p>

        <div className="flex flex-wrap gap-3">
          <div>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFile}
              className="hidden"
              id="student-upload"
            />
            <Button asChild className="gap-2">
              <label htmlFor="student-upload" className="cursor-pointer">
                <Upload className="h-4 w-4" />
                엑셀 파일 업로드
              </label>
            </Button>
          </div>
          {students.length > 0 && (
            <Button variant="outline" className="gap-2" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              엑셀 파일 다운로드
            </Button>
          )}
          {students.length > 0 && (
            <Button variant="destructive" className="gap-2" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
              명단 전체 삭제
            </Button>
          )}
        </div>

        <div className="mt-4 rounded-xl border bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            <FileSpreadsheet className="mr-1 inline h-3 w-3" />
            엑셀 파일에 <strong>학년, 반, 번호, 이름(성명)</strong> 열이 포함되어야 합니다.
          </p>
        </div>
      </div>

      {/* 개별 학생 추가 */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">학생 개별 추가</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-20">
            <label className="mb-1 block text-xs text-muted-foreground">학년</label>
            <Input
              type="number"
              placeholder="1"
              value={newGrade}
              onChange={(e) => setNewGrade(e.target.value)}
              min={1}
            />
          </div>
          <div className="w-20">
            <label className="mb-1 block text-xs text-muted-foreground">반</label>
            <Input
              placeholder="1"
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
            />
          </div>
          <div className="w-20">
            <label className="mb-1 block text-xs text-muted-foreground">번호</label>
            <Input
              type="number"
              placeholder="1"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              min={1}
            />
          </div>
          <div className="w-32">
            <label className="mb-1 block text-xs text-muted-foreground">이름</label>
            <Input
              placeholder="홍길동"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
            />
          </div>
          <Button className="gap-2" onClick={handleAddStudent}>
            <Plus className="h-4 w-4" />
            추가
          </Button>
        </div>
      </div>

      {/* 학생 검색 & 삭제 */}
      {students.length > 0 && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-foreground">학생 검색 및 삭제</h2>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="이름, 학년, 반, 번호로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {searchQuery.trim() ? (
            filteredStudents.length > 0 ? (
              <div className="max-h-64 overflow-y-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">학년</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">반</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">번호</th>
                      <th className="px-3 py-2 text-left font-medium text-muted-foreground">이름</th>
                      <th className="px-3 py-2 text-right font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents
                      .sort((a, b) => a.grade - b.grade || a.class.localeCompare(b.class) || a.number - b.number)
                      .map((s) => (
                        <tr key={`${s.grade}-${s.class}-${s.number}`} className="border-t">
                          <td className="px-3 py-2">{s.grade}</td>
                          <td className="px-3 py-2">{s.class}</td>
                          <td className="px-3 py-2">{s.number}</td>
                          <td className="px-3 py-2 font-medium">{s.name}</td>
                          <td className="px-3 py-2 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveStudent(s)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">검색 결과가 없습니다.</p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">검색어를 입력하면 학생 목록이 표시됩니다.</p>
          )}
        </div>
      )}

      {/* 반 순서 설정 */}
      {students.length > 0 && allClasses.length > 1 && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-foreground">
            <ListOrdered className="h-5 w-5 text-primary" />
            반 순서 설정
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            학교에서 정한 반 순서대로 조정하세요. 직접 기록 다이얼로그와 학생 명단에 반영됩니다.
          </p>
          <div className="space-y-2">
            {allClasses.map((c, idx) => (
              <div key={c} className="flex items-center gap-2 rounded-lg border bg-background p-2">
                <span className="w-6 text-center text-xs text-muted-foreground">{idx + 1}</span>
                <span className="flex-1 font-medium text-foreground">{c}반</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={idx === 0}
                  onClick={() => moveClass(idx, -1)}
                  aria-label="위로"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={idx === allClasses.length - 1}
                  onClick={() => moveClass(idx, 1)}
                  aria-label="아래로"
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4" onClick={resetClassOrder}>
            기본(가나다)순으로 초기화
          </Button>
        </div>
      )}

      {/* Summary */}
      {students.length > 0 && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Users className="h-5 w-5 text-primary" />
            저장된 학생 명단
            <span className="ml-auto text-sm font-normal text-muted-foreground">총 {students.length}명</span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {grades.map((g) => {
              const gradeStudents = students.filter((s) => s.grade === g);
              const classes = sortClasses([...new Set(gradeStudents.map((s) => s.class))]);
              return (
                <div key={g} className="rounded-xl border bg-background p-4">
                  <p className="mb-2 font-semibold text-foreground">{g}학년</p>
                  <div className="flex flex-wrap gap-2">
                    {classes.map((c) => {
                      const count = gradeStudents.filter((s) => s.class === c).length;
                      return (
                        <span key={c} className="rounded-lg bg-accent px-2 py-1 text-xs text-accent-foreground">
                          {c}반 ({count}명)
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
