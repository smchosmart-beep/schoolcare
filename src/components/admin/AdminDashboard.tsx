import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, ClipboardList, Heart, Stethoscope, Clock } from "lucide-react";
import VisitRecordModal from "./VisitRecordModal";

interface QueueItem {
  id: string;
  student_name: string;
  student_grade: number;
  student_class: number;
  student_number: number;
  created_at: string;
}

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
  status: string;
  visited_at: string;
  created_at: string;
}

interface Props {
  teacherId: string;
}

export default function AdminDashboard({ teacherId }: Props) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selfVisits, setSelfVisits] = useState<Visit[]>([]);
  const [teacherVisits, setTeacherVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const fetchData = useCallback(async () => {
    const [queueRes, visitsRes] = await Promise.all([
      supabase
        .from("waiting_queue")
        .select("*")
        .eq("teacher_id", teacherId)
        .gte("created_at", todayStr)
        .order("created_at", { ascending: true }),
      supabase
        .from("visits")
        .select("*")
        .eq("teacher_id", teacherId)
        .gte("visited_at", todayStr)
        .order("visited_at", { ascending: false }),
    ]);

    if (queueRes.data) setQueue(queueRes.data);
    if (visitsRes.data) {
      setSelfVisits(visitsRes.data.filter((v) => v.visit_type === "self_treatment"));
      setTeacherVisits(visitsRes.data.filter((v) => v.visit_type === "teacher_visit"));
    }
  }, [teacherId, todayStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Realtime subscriptions
  useEffect(() => {
    const ch1 = supabase
      .channel("admin-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "waiting_queue" }, () => fetchData())
      .subscribe();
    const ch2 = supabase
      .channel("admin-visits")
      .on("postgres_changes", { event: "*", schema: "public", table: "visits" }, () => fetchData())
      .subscribe();
    return () => {
      supabase.removeChannel(ch1);
      supabase.removeChannel(ch2);
    };
  }, [fetchData]);

  const handleStartVisit = async (item: QueueItem) => {
    // Create a visit record from queue item
    const { data } = await supabase
      .from("visits")
      .insert({
        teacher_id: teacherId,
        student_grade: item.student_grade,
        student_class: item.student_class,
        student_number: item.student_number,
        student_name: item.student_name,
        visit_type: "teacher_visit",
        status: "pending",
      })
      .select()
      .single();

    // Remove from queue
    await supabase.from("waiting_queue").delete().eq("id", item.id);

    if (data) {
      setSelectedVisit(data);
      setModalOpen(true);
    }
    toast.success(`${item.student_name} 학생 진료를 시작합니다.`);
  };

  const handleRemoveFromQueue = async (id: string) => {
    await supabase.from("waiting_queue").delete().eq("id", id);
    toast.info("대기열에서 제거했습니다.");
  };

  const handleVisitClick = (visit: Visit) => {
    setSelectedVisit(visit);
    setModalOpen(true);
  };

  const handleSaveVisit = async (data: { health_issue: string; treatment: string; medication: string }) => {
    if (!selectedVisit) return;
    await supabase
      .from("visits")
      .update({
        health_issue: data.health_issue,
        treatment: data.treatment,
        medication: data.medication,
        status: "completed",
      })
      .eq("id", selectedVisit.id);
    toast.success("기록이 저장되었습니다.");
    setModalOpen(false);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Waiting Queue */}
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Clock className="h-5 w-5 text-secondary" />
          보건선생님 대기 명단
          <span className="ml-auto rounded-full bg-secondary/20 px-3 py-1 text-sm font-medium text-secondary-foreground">
            {queue.length}명
          </span>
        </h2>
        {queue.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">현재 대기 중인 학생이 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {queue.map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border bg-background p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{item.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.student_grade}학년 {item.student_class}반 {item.student_number}번 ·{" "}
                      {new Date(item.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleStartVisit(item)}>
                    진료 시작
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleRemoveFromQueue(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two columns: teacher visits & self treatments */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Teacher Visits */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Stethoscope className="h-5 w-5 text-primary" />
            보건선생님 진료
            <span className="ml-auto text-sm text-muted-foreground">{teacherVisits.length}건</span>
          </h2>
          {teacherVisits.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">오늘 진료 기록이 없습니다.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {teacherVisits.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleVisitClick(v)}
                  className="flex w-full items-center justify-between rounded-xl border bg-background p-3 text-left transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-medium text-foreground">{v.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.student_grade}학년 {v.student_class}반 · {v.health_issue || "기록 없음"}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      v.status === "completed"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary/20 text-secondary-foreground"
                    }`}
                  >
                    {v.status === "completed" ? "완료" : "진행중"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Self Treatments */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <Heart className="h-5 w-5 text-primary" />
            스스로 치료
            <span className="ml-auto text-sm text-muted-foreground">{selfVisits.length}건</span>
          </h2>
          {selfVisits.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">오늘 스스로 치료 기록이 없습니다.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selfVisits.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl border bg-background p-3">
                  <div>
                    <p className="font-medium text-foreground">{v.student_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {v.student_grade}학년 {v.student_class}반 · {v.self_treatment_item}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(v.visited_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Visit Record Modal */}
      <VisitRecordModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        visit={selectedVisit}
        onSave={handleSaveVisit}
      />
    </div>
  );
}
