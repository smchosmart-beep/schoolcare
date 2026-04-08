import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { loadStudents, getGrades, getClasses, getStudentsInClass, Student } from "@/lib/students";
import { Search } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (student: Student) => void;
}

export default function DirectVisitDialog({ open, onClose, onSelect }: Props) {
  const [grade, setGrade] = useState<string>("");
  const [cls, setCls] = useState<string>("");
  const [search, setSearch] = useState("");

  const students = useMemo(() => loadStudents(), [open]);
  const grades = useMemo(() => getGrades(students), [students]);
  const classes = useMemo(
    () => (grade ? getClasses(students, Number(grade)) : []),
    [students, grade]
  );

  const filteredStudents = useMemo(() => {
    if (!grade || !cls) return [];
    let list = getStudentsInClass(students, Number(grade), cls);
    if (search.trim()) {
      const q = search.trim();
      list = list.filter(
        (s) => s.name.includes(q) || String(s.number).includes(q)
      );
    }
    return list;
  }, [students, grade, cls, search]);

  const handleGradeChange = (v: string) => {
    setGrade(v);
    setCls("");
  };

  const handleSelect = (student: Student) => {
    onSelect(student);
    setGrade("");
    setCls("");
    setSearch("");
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      setGrade("");
      setCls("");
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

        <div className="flex gap-2">
          <Select value={grade} onValueChange={handleGradeChange}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="학년" />
            </SelectTrigger>
            <SelectContent>
              {grades.map((g) => (
                <SelectItem key={g} value={String(g)}>
                  {g}학년
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={cls} onValueChange={setCls} disabled={!grade}>
            <SelectTrigger className="w-24">
              <SelectValue placeholder="반" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}반
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="이름/번호"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-1">
          {grade && cls && filteredStudents.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              해당 학생이 없습니다.
            </p>
          )}
          {!grade || !cls ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              학년과 반을 선택해주세요.
            </p>
          ) : (
            filteredStudents.map((s) => (
              <button
                key={`${s.grade}-${s.class}-${s.number}`}
                onClick={() => handleSelect(s)}
                className="flex w-full items-center gap-3 rounded-lg border bg-background p-3 text-left transition-colors hover:bg-accent"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {s.number}
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
