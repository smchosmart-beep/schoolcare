import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Visit {
  id: string;
  student_name: string;
  student_grade: number;
  student_class: string;
  student_number: number;
  health_issue: string | null;
  treatment: string | null;
  medication: string | null;
  visited_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  visit: Visit | null;
  onSave: (data: { health_issue: string; treatment: string; medication: string }) => void;
}

export default function VisitRecordModal({ open, onClose, visit, onSave }: Props) {
  const [healthIssue, setHealthIssue] = useState("");
  const [treatment, setTreatment] = useState("");
  const [medication, setMedication] = useState("");

  useEffect(() => {
    if (visit) {
      setHealthIssue(visit.health_issue || "");
      setTreatment(visit.treatment || "");
      setMedication(visit.medication || "");
    }
  }, [visit]);

  if (!visit) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">
            {visit.student_name} ({visit.student_grade}학년 {visit.student_class}반 {visit.student_number}번)
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            방문 시간: {new Date(visit.visited_at).toLocaleString("ko-KR")}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>건강문제 (보건실에 왜 왔나요?)</Label>
            <Textarea
              placeholder="예: 두통, 복통, 넘어져서 무릎 찰과상..."
              value={healthIssue}
              onChange={(e) => setHealthIssue(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>처치 및 조치</Label>
            <Textarea
              placeholder="예: 소독 후 밴드 부착, 냉찜질..."
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label>투약 내용</Label>
            <Textarea
              placeholder="예: 타이레놀 1정, 소화제..."
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={() => onSave({ health_issue: healthIssue, treatment, medication })}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
