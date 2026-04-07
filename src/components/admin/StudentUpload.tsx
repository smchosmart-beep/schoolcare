import { useState, useRef } from "react";
import { loadStudents, saveStudents, type Student } from "@/lib/students";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, Trash2, Users } from "lucide-react";
import * as XLSX from "xlsx";

interface StudentUploadProps {
  onUploadComplete?: () => void;
}

export default function StudentUpload({ onUploadComplete }: StudentUploadProps = {}) {
  const [students, setStudents] = useState<Student[]>(loadStudents());
  const fileRef = useRef<HTMLInputElement>(null);

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

        // Try to detect columns: 학년, 반, 번호, 이름
        const header = rows[0]?.map((h: any) => String(h).trim()) || [];
        let gradeIdx = header.findIndex((h) => h.includes("학년"));
        let classIdx = header.findIndex((h) => h.includes("반"));
        let numberIdx = header.findIndex((h) => h.includes("번호") || h.includes("번"));
        let nameIdx = header.findIndex((h) => h.includes("이름") || h.includes("성명"));

        // Fallback: assume columns 0-3
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

  const grades = [...new Set(students.map((s) => s.grade))].sort((a, b) => a - b);

  return (
    <div className="space-y-6">
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
            <Button variant="destructive" className="gap-2" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
              명단 삭제
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
              const classes = [...new Set(gradeStudents.map((s) => s.class))].sort((a, b) => a.localeCompare(b));
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
