import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import QuickInputSettings, { type Preset } from "./QuickInputSettings";

interface Visit {
  id: string;
  student_name: string;
  student_grade: number;
  student_class: string;
  student_number: number;
  health_issue: string | null;
  treatment: string | null;
  medication: string | null;
  temperature: string | null;
  visited_at: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  visit: Visit | null;
  onSave: (data: { health_issue: string; treatment: string; medication: string; temperature: string }) => void;
  teacherId: string;
}

export default function VisitRecordModal({ open, onClose, visit, onSave, teacherId }: Props) {
  const [healthIssue, setHealthIssue] = useState("");
  const [treatment, setTreatment] = useState("");
  const [medication, setMedication] = useState("");
  const [temperature, setTemperature] = useState("");
  const [presets, setPresets] = useState<Preset[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const fetchPresets = useCallback(async () => {
    if (!teacherId) return;
    const { data } = await supabase
      .from("quick_input_presets")
      .select("slot_number, label, health_issue, treatment, medication")
      .eq("teacher_id", teacherId)
      .order("slot_number");
    if (data) setPresets(data);
  }, [teacherId]);

  useEffect(() => {
    if (open) fetchPresets();
  }, [open, fetchPresets]);

  useEffect(() => {
    if (visit) {
      setHealthIssue(visit.health_issue || "");
      setTreatment(visit.treatment || "");
      setMedication(visit.medication || "");
      setTemperature(visit.temperature || "");
    }
  }, [visit]);

  // F1~F8 keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const match = e.key.match(/^F(\d)$/);
      if (!match) return;
      const num = parseInt(match[1]);
      if (num < 1 || num > 8) return;
      e.preventDefault();
      const preset = presets.find((p) => p.slot_number === num);
      if (preset) {
        setHealthIssue(preset.health_issue);
        setTreatment(preset.treatment);
        setMedication(preset.medication);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, presets]);

  const applyPreset = (slot: number) => {
    const preset = presets.find((p) => p.slot_number === slot);
    if (preset) {
      setHealthIssue(preset.health_issue);
      setTreatment(preset.treatment);
      setMedication(preset.medication);
    }
  };

  if (!visit) return null;

  return (
    <>
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

          {/* Quick Input Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((slot) => {
              const preset = presets.find((p) => p.slot_number === slot);
              const hasContent = preset && (preset.health_issue || preset.treatment || preset.medication);
              return (
                <Button
                  key={slot}
                  variant={hasContent ? "secondary" : "outline"}
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => applyPreset(slot)}
                  title={preset?.label || `F${slot}`}
                >
                  <span className="font-mono mr-1 opacity-60">F{slot}</span>
                  {preset?.label ? (
                    <span className="max-w-[4rem] truncate">{preset.label}</span>
                  ) : null}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 ml-auto"
              onClick={() => setSettingsOpen(true)}
              title="빠른 입력 설정"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>증상</Label>
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
            <div className="space-y-2">
              <Label>체온</Label>
              <Input
                placeholder="예: 37.5"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
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

      <QuickInputSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        teacherId={teacherId}
        presets={presets}
        onPresetsUpdated={fetchPresets}
      />
    </>
  );
}
