import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfDay, endOfDay, eachDayOfInterval, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarIcon, Search, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface VisitStatisticsProps {
  teacherId: string;
}

interface DayStat {
  date: Date;
  selfCount: number;
  teacherCount: number;
  total: number;
}

export default function VisitStatistics({ teacherId }: VisitStatisticsProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DayStat[] | null>(null);
  const [totals, setTotals] = useState({ self: 0, teacher: 0, all: 0 });

  const doSearch = useCallback(async (start: Date, end: Date) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("visits")
        .select("visited_at, visit_type")
        .eq("teacher_id", teacherId)
        .gte("visited_at", startOfDay(start).toISOString())
        .lte("visited_at", endOfDay(end).toISOString());

      if (error) throw error;

      const days = eachDayOfInterval({ start, end });
      let totalSelf = 0;
      let totalTeacher = 0;

      const dayStats: DayStat[] = days.map((day) => {
        const dayStart = startOfDay(day).getTime();
        const dayEnd = endOfDay(day).getTime();
        const dayVisits = (data || []).filter((v) => {
          const t = new Date(v.visited_at).getTime();
          return t >= dayStart && t <= dayEnd;
        });
        const selfCount = dayVisits.filter((v) => v.visit_type === "self_treatment").length;
        const teacherCount = dayVisits.filter((v) => v.visit_type !== "self_treatment").length;
        totalSelf += selfCount;
        totalTeacher += teacherCount;
        return { date: day, selfCount, teacherCount, total: selfCount + teacherCount };
      });

      setStats(dayStats);
      setTotals({ self: totalSelf, teacher: totalTeacher, all: totalSelf + totalTeacher });
    } catch {
      toast.error("데이터 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  const handleSearch = async () => {
    if (!startDate || !endDate) {
      toast.error("시작일과 종료일을 모두 선택해주세요.");
      return;
    }
    if (startDate > endDate) {
      toast.error("시작일이 종료일보다 늦을 수 없습니다.");
      return;
    }
    doSearch(startDate, endDate);
  };

  const handleQuickSelect = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    doSearch(start, end);
  };

  const handleExport = () => {
    if (!stats || !startDate || !endDate) return;

    const rows = stats.map((s) => ({
      "날짜": format(s.date, "yyyy-MM-dd"),
      "요일": format(s.date, "E", { locale: ko }),
      "스스로 치료": s.selfCount,
      "선생님 치료": s.teacherCount,
      "합계": s.total,
    }));

    rows.push({
      "날짜": "합계",
      "요일": "",
      "스스로 치료": totals.self,
      "선생님 치료": totals.teacher,
      "합계": totals.all,
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 12 },
      { wch: 6 },
      { wch: 12 },
      { wch: 12 },
      { wch: 8 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "이용현황");
    XLSX.writeFile(wb, `이용현황_${format(startDate, "yyyy-MM-dd")}~${format(endDate, "yyyy-MM-dd")}.xlsx`);
    toast.success("엑셀 파일이 다운로드되었습니다.");
  };

  const dayOfWeek = (date: Date) => format(date, "E", { locale: ko });

  const now = new Date();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">기간 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick select buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => handleQuickSelect(startOfMonth(now), endOfMonth(now))}>
              이번 달
            </Button>
            <Button variant="outline" size="sm" onClick={() => { const d = subMonths(now, 1); handleQuickSelect(startOfMonth(d), endOfMonth(d)); }}>
              지난달
            </Button>
            <Button variant="outline" size="sm" onClick={() => { const d = subMonths(now, 2); handleQuickSelect(startOfMonth(d), endOfMonth(d)); }}>
              2개월 전
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleQuickSelect(startOfYear(now), endOfYear(now))}>
              올해
            </Button>
            <Button variant="outline" size="sm" onClick={() => { const d = subMonths(now, 12); handleQuickSelect(startOfYear(d), endOfYear(d)); }}>
              작년
            </Button>
          </div>

          {/* Date pickers */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-3">
              <label className="block text-sm text-muted-foreground">시작일</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "yyyy-MM-dd") : "선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <span className="pb-2 px-2 text-muted-foreground">~</span>
            <div className="space-y-3">
              <label className="block text-sm text-muted-foreground">종료일</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "yyyy-MM-dd") : "선택"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={handleSearch} disabled={loading} className="gap-2">
              <Search className="h-4 w-4" />
              조회
            </Button>
          </div>
        </CardContent>
      </Card>

      {stats !== null && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">총 방문 건수</p>
                <p className="text-3xl font-bold text-primary">{totals.all}건</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">스스로 치료</p>
                <p className="text-3xl font-bold text-secondary">{totals.self}건</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">선생님 치료</p>
                <p className="text-3xl font-bold text-accent-foreground">{totals.teacher}건</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">일별 방문 현황</CardTitle>
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                엑셀 다운로드
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>날짜</TableHead>
                    <TableHead>요일</TableHead>
                    <TableHead className="text-right">스스로 치료</TableHead>
                    <TableHead className="text-right">선생님 치료</TableHead>
                    <TableHead className="text-right">합계</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map((s) => (
                    <TableRow key={s.date.toISOString()}>
                      <TableCell>{format(s.date, "M/d")}</TableCell>
                      <TableCell>{dayOfWeek(s.date)}</TableCell>
                      <TableCell className="text-right">{s.selfCount}</TableCell>
                      <TableCell className="text-right">{s.teacherCount}</TableCell>
                      <TableCell className="text-right font-medium">{s.total}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell colSpan={2}>합계</TableCell>
                    <TableCell className="text-right">{totals.self}</TableCell>
                    <TableCell className="text-right">{totals.teacher}</TableCell>
                    <TableCell className="text-right">{totals.all}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}