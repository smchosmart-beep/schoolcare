import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings, ChevronDown } from "lucide-react";
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

  // F1~F8 + Alt+1~9 keyboard shortcuts
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      // Alt+1~9 for extra presets
      if (e.altKey && /^[1-9]$/.test(e.key)) {
        e.preventDefault();
        const extraPresets = presets.filter((p) => p.slot_number > 8).slice(0, 9);
        const idx = parseInt(e.key) - 1;
        if (extraPresets[idx]) {
          applyPreset(extraPresets[idx].slot_number);
        }
        return;
      }
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {visit.student_name} ({visit.student_grade}학년 {visit.student_class}반 {visit.student_number}번)
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              방문 시간: {new Date(visit.visited_at).toLocaleString("ko-KR")}
            </p>
          </DialogHeader>

          {/* Quick Input Buttons */}
          <div className="space-y-1">
            {/* Row 1: F1~F4 + 더보기 + 설정 */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 4 }, (_, i) => i + 1).map((slot) => {
                const preset = presets.find((p) => p.slot_number === slot);
                const hasContent = preset && (preset.health_issue || preset.treatment || preset.medication);
                return (
                  <Button
                    key={slot}
                    variant={hasContent ? "secondary" : "outline"}
                    size="sm"
className="h-7 w-[6.5rem] px-1 text-xs"
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
              {presets.filter((p) => p.slot_number > 8).length > 0 && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 flex-1 px-2 text-xs">
                      빠른 입력 추가 <ChevronDown className="h-3 w-3 ml-0.5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 pointer-events-auto" align="start">
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {presets
                        .filter((p) => p.slot_number > 8)
                        .slice(0, 9)
                        .map((preset, index) => (
                          <Button
                            key={preset.slot_number}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start h-8 text-xs"
                            onClick={() => applyPreset(preset.slot_number)}
                          >
                            <span className="font-mono text-[10px] opacity-50 mr-1.5">#{index + 1}</span>
                            <span className="font-semibold mr-2">{preset.label || `프리셋 ${index + 1}`}</span>
                            <span className="text-muted-foreground truncate">
                              {preset.health_issue || preset.treatment || ""}
                            </span>
                            <span className="ml-auto text-[10px] opacity-40">Alt+{index + 1}</span>
                          </Button>
                        ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            {/* Row 2: F5~F8 + 설정 버튼 */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 4 }, (_, i) => i + 5).map((slot) => {
                const preset = presets.find((p) => p.slot_number === slot);
                const hasContent = preset && (preset.health_issue || preset.treatment || preset.medication);
                return (
                  <Button
                    key={slot}
                    variant={hasContent ? "secondary" : "outline"}
                    size="sm"
                    className="h-7 w-[6.5rem] px-1 text-xs"
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
                className="ml-auto flex-1 h-7 px-2 text-xs text-muted-foreground"
                onClick={() => setSettingsOpen(true)}
              >
                <Settings className="h-3.5 w-3.5 mr-1" />
                빠른 입력 설정
              </Button>
            </div>
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
            <Button onClick={() => onSave({ health_issue: healthIssue, treatment, medication, temperature })}>
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
