import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Preset {
  slot_number: number;
  label: string;
  health_issue: string;
  treatment: string;
  medication: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  teacherId: string;
  presets: Preset[];
  onPresetsUpdated: () => void;
}

export default function QuickInputSettings({ open, onClose, teacherId, presets, onPresetsUpdated }: Props) {
  const [localPresets, setLocalPresets] = useState<Preset[]>([]);

  useEffect(() => {
    const slots: Preset[] = [];
    for (let i = 1; i <= 8; i++) {
      const existing = presets.find((p) => p.slot_number === i);
      slots.push(existing ?? { slot_number: i, label: "", health_issue: "", treatment: "", medication: "" });
    }
    setLocalPresets(slots);
  }, [presets, open]);

  const updateSlot = (idx: number, field: keyof Preset, value: string) => {
    setLocalPresets((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const handleSave = async () => {
    // Upsert all slots that have any content
    const toUpsert = localPresets.filter((p) => p.label || p.health_issue || p.treatment || p.medication);
    const toDelete = localPresets.filter((p) => !p.label && !p.health_issue && !p.treatment && !p.medication);

    if (toDelete.length > 0) {
      await supabase
        .from("quick_input_presets")
        .delete()
        .eq("teacher_id", teacherId)
        .in("slot_number", toDelete.map((p) => p.slot_number));
    }

    if (toUpsert.length > 0) {
      const { error } = await supabase.from("quick_input_presets").upsert(
        toUpsert.map((p) => ({
          teacher_id: teacherId,
          slot_number: p.slot_number,
          label: p.label,
          health_issue: p.health_issue,
          treatment: p.treatment,
          medication: p.medication,
        })),
        { onConflict: "teacher_id,slot_number" }
      );
      if (error) {
        toast.error("저장 실패: " + error.message);
        return;
      }
    }

    toast.success("빠른 입력 설정이 저장되었습니다.");
    onPresetsUpdated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>빠른 입력 설정 (F1~F8)</DialogTitle>
        </DialogHeader>

        <Accordion type="multiple" className="w-full">
          {localPresets.map((preset, idx) => (
            <AccordionItem key={preset.slot_number} value={`slot-${preset.slot_number}`}>
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-8 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
                    F{preset.slot_number}
                  </span>
                  {preset.label || "(미설정)"}
                </span>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 px-1">
                <div className="space-y-1">
                  <Label className="text-xs">라벨 (버튼에 표시)</Label>
                  <Input
                    placeholder="예: 두통"
                    value={preset.label}
                    onChange={(e) => updateSlot(idx, "label", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">증상</Label>
                  <Textarea
                    placeholder="예: 두통 호소"
                    value={preset.health_issue}
                    onChange={(e) => updateSlot(idx, "health_issue", e.target.value)}
                    rows={1}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">처치 및 조치</Label>
                  <Textarea
                    placeholder="예: 타이레놀 1정 투약 후 휴식"
                    value={preset.treatment}
                    onChange={(e) => updateSlot(idx, "treatment", e.target.value)}
                    rows={1}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">투약 내용</Label>
                  <Textarea
                    placeholder="예: 타이레놀 1정"
                    value={preset.medication}
                    onChange={(e) => updateSlot(idx, "medication", e.target.value)}
                    rows={1}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
