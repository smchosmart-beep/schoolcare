import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameDay, getDay } from "date-fns";
import { ko } from "date-fns/locale";
import { Download, Calendar, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import VisitRecordModal from "./VisitRecordModal";
import * as XLSX from "xlsx";

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

type ViewMode = "daily" | "weekly" | "monthly";

interface Props {
  teacherId: string;
}

export default function HealthJournal({ teacherId }: Props) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const getDateRange = useCallback(() => {
    if (viewMode === "daily") {
      const start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    } else if (viewMode === "weekly") {
      return { start: startOfWeek(currentDate, { weekStartsOn: 1 }), end: endOfWeek(currentDate, { weekStartsOn: 1 }) };
    } else {
      return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
    }
  }, [currentDate, viewMode]);

  const fetchVisits = useCallback(async () => {
    const { start, end } = getDateRange();
    const { data } = await supabase.rpc("get_visits_decrypted", {
      p_teacher_id: teacherId,
      p_start_date: start.toISOString(),
      p_end_date: end.toISOString(),
    });
    if (data) setVisits(data as unknown as Visit[]);
  }, [teacherId, getDateRange]);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === "daily") d.setDate(d.getDate() + dir);
    else if (viewMode === "weekly") d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const getDateLabel = () => {
    if (viewMode === "daily") return format(currentDate, "yyyy년 M월 d일 (EEE)", { locale: ko });
    if (viewMode === "weekly") {
      const { start, end } = getDateRange();
      return `${format(start, "M/d", { locale: ko })} ~ ${format(end, "M/d", { locale: ko })}`;
    }
    return format(currentDate, "yyyy년 M월", { locale: ko });
  };

  const formatVisitRow = (v: Visit) => ({
    일시: format(new Date(v.visited_at), "M/d(EEE) HH:mm", { locale: ko }),
    학년: v.student_grade,
    반: v.student_class,
    번호: v.student_number,
    이름: v.student_name,
    유형: v.visit_type === "self_treatment" ? "스스로" : "선생님",
    "스스로 치료 항목": v.self_treatment_item || "",
    증상: v.health_issue || "",
    "처치 및 조치": v.treatment || (v.visit_type === "self_treatment" ? v.self_treatment_item : "") || "",
    투약내용: v.medication || "",
    체온: v.temperature || "",
    상태: v.status === "completed" ? "완료" : "진행중",
  });

  const applyColumnWidths = (ws: XLSX.WorkSheet) => {
    ws["!cols"] = [
      { wch: 12 },  // 날짜
      { wch: 8 },   // 시간
      { wch: 5 },   // 학년
      { wch: 5 },   // 반
      { wch: 5 },   // 번호
      { wch: 7 },   // 이름
      { wch: 15 },  // 유형
      { wch: 25 },  // 스스로 치료 항목
      { wch: 25 },  // 건강문제
      { wch: 65 },  // 처치 및 조치
      { wch: 30 },  // 투약내용
      { wch: 6 },   // 체온
      { wch: 8 },   // 상태
    ];
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    if (viewMode === "weekly") {
      const { start } = getDateRange();
      const dayNames = ["월", "화", "수", "목", "금"];

      for (let i = 0; i < 5; i++) {
        const day = addDays(start, i);
        const dayVisits = visits.filter((v) => isSameDay(new Date(v.visited_at), day));
        const sheetName = `${dayNames[i]}(${format(day, "M-d")})`;
        const rows = dayVisits.length > 0
          ? dayVisits.map(formatVisitRow)
          : [{ 날짜: format(day, "yyyy-MM-dd"), 시간: "", 학년: "", 반: "", 번호: "", 이름: "기록 없음", 유형: "", "스스로 치료 항목": "", 건강문제: "", "처치 및 조치": "", 투약내용: "", 상태: "" }];
        const ws = XLSX.utils.json_to_sheet(rows);
        applyColumnWidths(ws);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      }

      const { end } = getDateRange();
      XLSX.writeFile(wb, `보건일지_주간_${format(start, "yyyyMMdd")}-${format(end, "yyyyMMdd")}.xlsx`);
    } else if (viewMode === "monthly") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      // Calculate week boundaries (Monday-based)
      const weeks: { label: string; start: Date; end: Date }[] = [];
      let weekStart = monthStart;
      let weekNum = 1;

      while (weekStart <= monthEnd) {
        // Find the end of this week (Sunday) or end of month
        const dayOfWeek = getDay(weekStart); // 0=Sun, 1=Mon, ...
        const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
        let weekEnd = addDays(weekStart, daysUntilSunday);
        if (weekEnd > monthEnd) weekEnd = monthEnd;

        weeks.push({ label: `${weekNum}주차`, start: weekStart, end: weekEnd });
        weekNum++;
        weekStart = addDays(weekEnd, 1);
      }

      for (const week of weeks) {
        const weekVisits = visits.filter((v) => {
          const d = new Date(v.visited_at);
          return d >= week.start && d <= new Date(week.end.getFullYear(), week.end.getMonth(), week.end.getDate(), 23, 59, 59, 999);
        });
        const rows = weekVisits.length > 0
          ? weekVisits.map(formatVisitRow)
          : [{ 일시: `${format(week.start, "M/d")}~${format(week.end, "M/d")}`, 학년: "", 반: "", 번호: "", 이름: "기록 없음", 유형: "", "스스로 치료 항목": "", 증상: "", "처치 및 조치": "", 투약내용: "", 체온: "", 상태: "" }];
        const ws = XLSX.utils.json_to_sheet(rows);
        applyColumnWidths(ws);
        XLSX.utils.book_append_sheet(wb, ws, week.label);
      }

      XLSX.writeFile(wb, `보건일지_월간_${format(currentDate, "yyyy년MM월")}.xlsx`);
    } else {
      const rows = visits.map(formatVisitRow);
      const ws = XLSX.utils.json_to_sheet(rows);
      applyColumnWidths(ws);
      XLSX.utils.book_append_sheet(wb, ws, "보건일지");
      XLSX.writeFile(wb, `보건일지_${format(currentDate, "yyyyMMdd")}.xlsx`);
    }

    toast.success("엑셀 파일이 다운로드되었습니다.");
  };

  const handleRowClick = (v: Visit) => {
    setSelectedVisit(v);
    setModalOpen(true);
  };

  const handleSave = async (data: { health_issue: string; treatment: string; medication: string; temperature: string }) => {
    if (!selectedVisit) return;
    const updateData: { health_issue: string; treatment: string; medication: string; temperature: string; visit_type?: string } = { ...data };
    if (selectedVisit.visit_type === "self_treatment" && data.health_issue?.trim()) {
      updateData.visit_type = "teacher_visit";
    }
    const { error } = await supabase
      .from("visits")
      .update(updateData as any)
      .eq("id", selectedVisit.id);
    if (error) {
      toast.error("수정에 실패했습니다.");
      return;
    }
    toast.success("보건일지가 수정되었습니다.");
    setModalOpen(false);
    setSelectedVisit(null);
    fetchVisits();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("이 기록을 삭제하시겠습니까?")) return;
    const { error } = await supabase.from("visits").delete().eq("id", id);
    if (error) {
      toast.error("삭제에 실패했습니다.");
      return;
    }
    toast.success("기록이 삭제되었습니다.");
    fetchVisits();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            보건일지
          </h2>

          <div className="flex items-center gap-2">
            {(["daily", "weekly", "monthly"] as ViewMode[]).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
              >
                {{ daily: "일별", weekly: "주별", monthly: "월별" }[mode]}
              </Button>
            ))}
          </div>
        </div>

        {/* Date navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">{getDateLabel()}</span>
          <Button variant="ghost" size="sm" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-accent p-4 text-center">
            <p className="text-2xl font-bold text-primary">{visits.length}</p>
            <p className="text-xs text-muted-foreground">전체</p>
          </div>
          <div className="rounded-xl bg-accent p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {visits.filter((v) => v.visit_type === "teacher_visit").length}
            </p>
            <p className="text-xs text-muted-foreground">보건선생님</p>
          </div>
          <div className="rounded-xl bg-accent p-4 text-center">
            <p className="text-2xl font-bold text-primary">
              {visits.filter((v) => v.visit_type === "self_treatment").length}
            </p>
            <p className="text-xs text-muted-foreground">스스로 치료</p>
          </div>
        </div>

        {/* Export */}
        <div className="mb-4">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExport} disabled={visits.length === 0}>
            <Download className="h-4 w-4" />
            엑셀 다운로드
          </Button>
        </div>

        {/* Table */}
        {visits.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">해당 기간에 기록이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">일시</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">학생</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">유형</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">증상</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">처치</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">투약</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">체온</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">작업</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b last:border-0 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleRowClick(v)}
                  >
                    <td className="whitespace-nowrap px-3 py-2 text-foreground">
                      {format(new Date(v.visited_at), "M/d(EEE) HH:mm", { locale: ko })}
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-foreground">{v.student_name}</span>
                      <span className="ml-1 text-xs text-muted-foreground">
                        {v.student_grade}-{v.student_class}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          v.visit_type === "self_treatment"
                            ? "bg-secondary/20 text-secondary-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {v.visit_type === "self_treatment" ? "스스로" : "선생님"}
                      </span>
                    </td>
                    <td className="max-w-[150px] truncate px-3 py-2 text-foreground">{v.health_issue || "-"}</td>
                    <td className="max-w-[150px] truncate px-3 py-2 text-foreground">{v.treatment || (v.visit_type === "self_treatment" ? v.self_treatment_item : null) || "-"}</td>
                    <td className="max-w-[100px] truncate px-3 py-2 text-foreground">{v.medication || "-"}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-foreground">{v.temperature || "-"}</td>
                    <td className="px-3 py-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(e, v.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <VisitRecordModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedVisit(null); }}
        visit={selectedVisit}
        onSave={handleSave}
        onDelete={async (id) => {
          const { error } = await supabase.from("visits").delete().eq("id", id);
          if (error) { toast.error("삭제에 실패했습니다."); return; }
          toast.success("기록이 삭제되었습니다.");
          setModalOpen(false);
          setSelectedVisit(null);
          fetchVisits();
        }}
        teacherId={teacherId}
      />
    </div>
  );
}
