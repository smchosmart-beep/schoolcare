import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { loadStudents, Student } from "@/lib/students";
import { Search } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (student: Student) => void;
}

export default function DirectVisitDialog({ open, onClose, onSelect }: Props) {
  const [search, setSearch] = useState("");

  const students = useMemo(() => loadStudents(), [open]);

  const filteredStudents = useMemo(() => {
    const q = search.trim();
    if (q.length < 2) return [];
    return students
      .filter((s) => s.name.includes(q) || String(s.number).includes(q))
      .sort((a, b) => a.grade - b.grade || a.class.localeCompare(b.class) || a.number - b.number);
  }, [students, search]);

  const handleSelect = (student: Student) => {
    onSelect(student);
    setSearch("");
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      setSearch("");
    }
  };

  if (students.length === 0) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>학생 검색</DialogTitle>
          </DialogHeader>
          <p className="py-8 text-center text-muted-foreground">
            학생 명단을 먼저 업로드해주세요.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>학생 검색</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="이름으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            autoFocus
          />
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1">
          {search.trim().length < 2 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              이름을 입력해주세요.
            </p>
          ) : filteredStudents.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              해당 학생이 없습니다.
            </p>
          ) : (
            filteredStudents.map((s) => (
              <button
                key={`${s.grade}-${s.class}-${s.number}`}
                onClick={() => handleSelect(s)}
                className="flex w-full items-center gap-3 rounded-lg border bg-background p-3 text-left transition-colors hover:bg-accent"
              >
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {s.grade}학년 {s.class}반 {s.number}번
                </span>
                <span className="font-medium text-foreground">{s.name}</span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
