import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import { format, addMinutes } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { addStudent } from "@/lib/students";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileUp, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

interface NeisRow {
  date: string; // yyyy-MM-dd
  seq: number;
  grade: number;
  cls: string;
  num: number;
  name: string;
  issue: string;
  treatment: string;
}

const DATE_RE = /^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./;
const GC_RE = /^(\d+)\s*-\s*(.+)$/;

function parseSheet(rows: any[][]): NeisRow[] {
  const out: NeisRow[] = [];
  let curDate = "";
  for (const row of rows) {
    if (!row) continue;
    const c1 = row[1];
    if (typeof c1 === "string") {
      const m = c1.match(DATE_RE);
      if (m) {
        curDate = `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
        continue;
      }
    }
    const seq = typeof c1 === "number" ? c1 : parseInt(String(c1 ?? ""));
    const name = String(row[2] ?? "").trim();
    const gc = String(row[6] ?? "").trim();
    if (!curDate || isNaN(seq) || !name) continue;
    const gm = gc.match(GC_RE);
    if (!gm) continue;
    const num = parseInt(String(row[9] ?? ""));
    if (isNaN(num)) continue;
    out.push({
      date: curDate,
      seq,
      grade: parseInt(gm[1]),
      cls: gm[2].trim(),
      num,
      name,
      issue: String(row[14] ?? "").trim(),
      treatment: String(row[36] ?? "").trim(),
    });
  }
  return out;
}

export default function NeisImport({ teacherId }: { teacherId: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<NeisRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const dates = [...new Set(rows.map((r) => r.date))].sort();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const parsed = parseSheet(data);
        if (parsed.length === 0) {
          toast.error("이관할 기록을 찾지 못했습니다. NEIS 보건일지 파일인지 확인해주세요.");
          return;
        }
        setRows(parsed);
        toast.success(`${parsed.length}건의 기록을 읽었습니다.`);
      } catch {
        toast.error("파일을 읽는 중 오류가 발생했습니다.");
      }
    };
    reader.readAsBinaryString(file);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImport = async () => {
    if (rows.length === 0) return;
    setImporting(true);
    setProgress(0);
    try {
      const { data: existing, error: qErr } = await supabase
        .from("visits")
        .select("student_grade, student_class, student_number, visited_at")
        .eq("teacher_id", teacherId)
        .gte("visited_at", `${dates[0]}T00:00:00+09:00`)
        .lt("visited_at", `${dates[dates.length - 1]}T23:59:59+09:00`);
      if (qErr) throw qErr;

      const existingKeys = new Set(
        (existing ?? []).map(
          (v) => `${format(new Date(v.visited_at), "yyyy-MM-dd")}|${v.student_grade}|${v.student_class}|${v.student_number}`
        )
      );
      const toInsert = rows.filter(
        (r) => !existingKeys.has(`${r.date}|${r.grade}|${r.cls}|${r.num}`)
      );
      const skipped = rows.length - toInsert.length;

      // 로컬 학생 명단 동기화
      let studentsAdded = 0;
      const seen = new Set<string>();
      for (const r of rows) {
        const key = `${r.grade}|${r.cls}|${r.num}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (addStudent({ grade: r.grade, class: r.cls, number: r.num, name: r.name }).success) {
          studentsAdded++;
        }
      }

      const chunk = 500;
      let inserted = 0;
      for (let i = 0; i < toInsert.length; i += chunk) {
        const batch = toInsert.slice(i, i + chunk).map((r) => ({
          teacher_id: teacherId,
          student_grade: r.grade,
          student_class: r.cls,
          student_number: r.num,
          student_name: r.name,
          health_issue: r.issue || null,
          treatment: r.treatment || null,
          visit_type: "teacher_visit",
          status: "completed",
          visited_at: addMinutes(new Date(`${r.date}T09:00:00`), r.seq - 1).toISOString(),
        }));
        const { error } = await supabase.from("visits").insert(batch);
        if (error) throw error;
        inserted += batch.length;
        setProgress(Math.round((inserted / toInsert.length) * 100));
      }

      toast.success(
        `이관 완료: 기록 ${inserted}건 등록` +
          (skipped ? `, 중복 ${skipped}건 건너뜀` : "") +
          (studentsAdded ? `, 학생 ${studentsAdded}명 명단 추가` : "")
      );
      setRows([]);
    } catch (err: any) {
      toast.error("이관 중 오류: " + (err?.message ?? "알 수 없는 오류"));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-foreground">NEIS 보건일지 가져오기</h2>
      <p className="mb-6 text-sm text-muted-foreground">
        NEIS에서 내려받은 보건일지 엑셀을 업로드하면 방문 기록을 날짜별로 가져오고, 등장한 학생을 명단에도 함께 등록합니다.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          className="hidden"
          id="neis-import"
        />
        <Button asChild variant="outline" className="gap-2" disabled={importing}>
          <label htmlFor="neis-import" className="cursor-pointer">
            <FileUp className="h-4 w-4" />
            보건일지 파일 선택
          </label>
        </Button>
        {rows.length > 0 && (
          <Button className="gap-2" onClick={handleImport} disabled={importing}>
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            {importing ? `이관 중... ${progress}%` : `${rows.length}건 가져오기`}
          </Button>
        )}
      </div>

      {rows.length > 0 && (
        <div className="mt-4 rounded-xl border bg-muted/50 p-4 text-sm">
          <p className="font-medium text-foreground">
            총 {rows.length}건 · 기간 {format(new Date(dates[0]), "yyyy년 M월 d일")} ~{" "}
            {format(new Date(dates[dates.length - 1]), "yyyy년 M월 d일")} ({dates.length}일치)
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            같은 날짜·학년·반·번호로 이미 등록된 기록은 중복 저장되지 않습니다.
          </p>
          <div className="mt-3 max-h-40 overflow-y-auto rounded-lg border bg-background">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="px-2 py-1 text-left font-medium text-muted-foreground">날짜</th>
                  <th className="px-2 py-1 text-left font-medium text-muted-foreground">학년반</th>
                  <th className="px-2 py-1 text-left font-medium text-muted-foreground">번호</th>
                  <th className="px-2 py-1 text-left font-medium text-muted-foreground">이름</th>
                  <th className="px-2 py-1 text-left font-medium text-muted-foreground">증상</th>
                  <th className="px-2 py-1 text-left font-medium text-muted-foreground">처치</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-2 py-1">{r.date}</td>
                    <td className="px-2 py-1">{r.grade}-{r.cls}</td>
                    <td className="px-2 py-1">{r.num}</td>
                    <td className="px-2 py-1 font-medium">{r.name}</td>
                    <td className="px-2 py-1">{r.issue || "-"}</td>
                    <td className="px-2 py-1">{r.treatment || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && (
            <p className="mt-1 text-xs text-muted-foreground">외 {rows.length - 10}건...</p>
          )}
        </div>
      )}
    </div>
  );
}
