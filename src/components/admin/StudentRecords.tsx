import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format, endOfMonth } from "date-fns";
import { ko } from "date-fns/locale";
import { Search, Printer, UserSearch } from "lucide-react";
import { loadStudents, Student } from "@/lib/students";

interface Visit {
  id: string;
  student_name: string;
  student_grade: number;
  student_class: string;
  student_number: number;
  visit_type: string;
  self_treatment_item: string | null;
  health_issue: string | null;
  treatment: string | null;
  medication: string | null;
  temperature: string | null;
  status: string;
  visited_at: string;
}

interface Props {
  teacherId: string;
}

function getSchoolYearRange(): { start: string; end: string } {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1; // 1-12
  const startYear = month >= 3 ? year : year - 1;
  const start = `${startYear}-03-01`;
  const end = format(endOfMonth(new Date(startYear + 1, 1, 1)), "yyyy-MM-dd");
  return { start, end };
}

export default function StudentRecords({ teacherId }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState(getSchoolYearRange);

  const results = useMemo(() => {
    const q = query.trim();
    if (q.length < 1) return [];
    return loadStudents()
      .filter((s) => s.name.includes(q))
      .sort((a, b) => a.grade - b.grade || a.class.localeCompare(b.class, "ko") || a.number - b.number)
      .slice(0, 20);
  }, [query]);

  const fetchRecords = async (student: Student, range = dateRange) => {
    setLoading(true);
    const endDate = new Date(range.end);
    endDate.setDate(endDate.getDate() + 1); // 종료일 포함
    const { data, error } = await supabase.rpc("get_visits_decrypted", {
      p_teacher_id: teacherId,
      p_start_date: new Date(range.start).toISOString(),
      p_end_date: endDate.toISOString(),
    });
    setLoading(false);
    if (error) {
      toast.error("기록을 불러오지 못했습니다.");
      return;
    }
    const filtered = ((data as unknown as Visit[]) || []).filter(
      (v) =>
        v.student_name === student.name &&
        v.student_grade === student.grade &&
        v.student_class === student.class &&
        v.student_number === student.number
    );
    setVisits(filtered);
  };

  const handleSelect = (s: Student) => {
    setSelected(s);
    setQuery("");
    const range = getSchoolYearRange();
    setDateRange(range);
    fetchRecords(s, range);
  };

  const handleApplyRange = () => {
    if (selected) fetchRecords(selected);
  };

  const topIssues = useMemo(() => {
    const counts = new Map<string, number>();
    visits.forEach((v) => {
      const key = v.health_issue || v.self_treatment_item;
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  }, [visits]);

  return (
    <div className="space-y-6">
      {/* 검색 영역 (인쇄 제외) */}
      <div className="no-print rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <UserSearch className="h-5 w-5 text-primary" />
          학생 검색
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="학생 이름을 입력하세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {query.trim().length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {results.length === 0 ? (
              <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
                검색 결과가 없습니다. 학생명단에 등록된 이름인지 확인해 주세요.
              </p>
            ) : (
              results.map((s) => (
                <button
                  key={`${s.grade}-${s.class}-${s.number}`}
                  onClick={() => handleSelect(s)}
                  className="flex flex-col items-center rounded-xl border bg-background px-3 py-2 transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="text-xs text-muted-foreground">
                    {s.grade}학년 {s.class}반 {s.number}번
                  </span>
                  <span className="font-semibold text-foreground">{s.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* 결과 영역 */}
      {selected && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm print-area">
          {/* 인쇄 전용 제목 */}
          <div className="print-only mb-4 hidden text-center">
            <h1 className="text-xl font-bold">
              {selected.grade}학년 {selected.class}반 {selected.number}번 {selected.name} 보건실 방문 기록
            </h1>
            <p className="mt-1 text-sm">
              조회기간: {dateRange.start} ~ {dateRange.end} · 인쇄일: {format(new Date(), "yyyy년 M월 d일", { locale: ko })}
            </p>
          </div>

          <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {selected.grade}학년 {selected.class}반 {selected.number}번 {selected.name}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-sm">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((r) => ({ ...r, start: e.target.value }))}
                  className="h-8 w-36"
                />
                <span className="text-muted-foreground">~</span>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((r) => ({ ...r, end: e.target.value }))}
                  className="h-8 w-36"
                />
                <Button size="sm" variant="outline" onClick={handleApplyRange}>
                  조회
                </Button>
              </div>
            </div>
            <Button size="sm" className="gap-2" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              인쇄하기
            </Button>
          </div>

          {/* 요약 */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-accent p-4 text-center print:border">
              <p className="text-2xl font-bold text-primary">{visits.length}</p>
              <p className="text-xs text-muted-foreground">총 방문 횟수</p>
            </div>
            <div className="rounded-xl bg-accent p-4 text-center print:border">
              <p className="text-2xl font-bold text-primary">
                {visits.length > 0 ? format(new Date(visits[0].visited_at), "M/d", { locale: ko }) : "-"}
              </p>
              <p className="text-xs text-muted-foreground">최근 방문일</p>
            </div>
            <div className="rounded-xl bg-accent p-4 text-center print:border">
              <p className="text-sm font-bold text-primary">
                {topIssues.length > 0 ? topIssues.map(([k]) => k).join(", ") : "-"}
              </p>
              <p className="text-xs text-muted-foreground">주요 증상</p>
            </div>
          </div>

          {/* 기록 표 */}
          {loading ? (
            <p className="py-12 text-center text-muted-foreground">불러오는 중...</p>
          ) : visits.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">해당 기간에 방문 기록이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border print:rounded-none">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">일시</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">유형</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">증상</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">처치</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">투약</th>
                    <th className="px-3 py-2 text-left font-medium text-muted-foreground">체온</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.map((v) => (
                    <tr key={v.id} className="border-b last:border-0">
                      <td className="whitespace-nowrap px-3 py-2 text-foreground">
                        {format(new Date(v.visited_at), "yyyy.M.d(EEE) HH:mm", { locale: ko })}
                      </td>
                      <td className="px-3 py-2">
                        {v.visit_type === "self_treatment" ? "스스로" : "선생님"}
                      </td>
                      <td className="px-3 py-2 text-foreground">{v.health_issue || "-"}</td>
                      <td className="px-3 py-2 text-foreground">
                        {v.treatment || (v.visit_type === "self_treatment" ? v.self_treatment_item : null) || "-"}
                      </td>
                      <td className="px-3 py-2 text-foreground">{v.medication || "-"}</td>
                      <td className="whitespace-nowrap px-3 py-2 text-foreground">{v.temperature || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
