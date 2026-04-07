import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Option {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}

const EMOJI_LIST = [
  "💊", "🩹", "🧊", "🌡️", "💧", "🏥", "❤️‍🩹", "🦷", "👁️", "🤧",
  "🧴", "💉", "🩺", "🧻", "🫁", "🤕", "🤒", "😷", "🩼", "👃",
  "🦴", "🫀", "🧽", "✋", "🦵",
];

interface Props {
  teacherId: string;
}

export default function SelfTreatmentSettings({ teacherId }: Props) {
  const [options, setOptions] = useState<Option[]>([]);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("💊");
  const [loading, setLoading] = useState(false);

  const fetchOptions = useCallback(async () => {
    const { data } = await supabase
      .from("self_treatment_options")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("sort_order", { ascending: true });
    if (data) setOptions(data);
  }, [teacherId]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error("항목 이름을 입력해주세요.");
      return;
    }
    setLoading(true);
    await supabase.from("self_treatment_options").insert({
      teacher_id: teacherId,
      name: newName.trim(),
      icon: newIcon,
      sort_order: options.length,
    });
    setNewName("");
    setNewIcon("💊");
    setLoading(false);
    toast.success("항목이 추가되었습니다.");
    fetchOptions();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("self_treatment_options").delete().eq("id", id);
    toast.info("항목이 삭제되었습니다.");
    fetchOptions();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-foreground">스스로 치료 항목 설정</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          학생들이 키오스크에서 선택할 수 있는 간단한 처치 항목을 관리합니다.
        </p>

        {/* Add new item */}
        <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border bg-background p-4">
          <div className="space-y-2">
            <Label>아이콘</Label>
            <div className="flex flex-wrap gap-1">
              {EMOJI_LIST.map((e) => (
                <button
                  key={e}
                  onClick={() => setNewIcon(e)}
                  className={`rounded-lg p-2 text-xl transition-colors ${
                    newIcon === e ? "bg-primary/10 ring-2 ring-primary" : "hover:bg-muted"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-[200px] space-y-2">
            <Label>항목 이름</Label>
            <Input
              placeholder="예: 물파스 바르기"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
          </div>
          <Button onClick={handleAdd} disabled={loading} className="gap-2">
            <Plus className="h-4 w-4" />
            추가
          </Button>
        </div>

        {/* List */}
        <div className="space-y-2">
          {options.map((opt) => (
            <div
              key={opt.id}
              className="flex items-center justify-between rounded-xl border bg-background p-4"
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl">{opt.icon}</span>
                <span className="font-medium text-foreground">{opt.name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(opt.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {options.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              아직 추가된 항목이 없습니다. 위에서 항목을 추가해주세요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
