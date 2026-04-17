import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { loadStudents, Student, sortClasses } from "@/lib/students";
import { Search, ArrowLeft } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (student: Student) => void;
}

export default function DirectVisitDialog({ open, onClose, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<"grade" | "name">("name");
  const [selectedClass, setSelectedClass] = useState<{ grade: number; class: string } | null>(null);

  const students = useMemo(() => loadStudents(), [open]);

  const { grades, classes, classMap } = useMemo(() => {
    const gSet = new Set<number>();
    const cSet = new Set<string>();
    const map = new Map<string, boolean>();
    students.forEach((s) => {
      gSet.add(s.grade);
      cSet.add(s.class);
      map.set(`${s.grade}-${s.class}`, true);
    });
    return {
      grades: Array.from(gSet).sort((a, b) => a - b),
      classes: sortClasses(Array.from(cSet)),
      classMap: map,
    };
  }, [students]);

  const filteredStudents = useMemo(() => {
    const q = search.trim();
    if (q.length < 2) return [];
    return students
      .filter((s) => s.name.includes(q) || String(s.number).includes(q))
      .sort((a, b) => a.grade - b.grade || a.class.localeCompare(b.class, "ko") || a.number - b.number);
  }, [students, search]);

  const studentsInClass = useMemo(() => {
    if (!selectedClass) return [];
    return students
      .filter((s) => s.grade === selectedClass.grade && s.class === selectedClass.class)
      .sort((a, b) => a.number - b.number);
  }, [students, selectedClass]);

  const resetState = () => {
    setSearch("");
    setMode("name");
    setSelectedClass(null);
  };

  const handleSelect = (student: Student) => {
    onSelect(student);
    resetState();
  };

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      onClose();
      resetState();
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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>학생 검색</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "grade" | "name")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="name">이름 검색</TabsTrigger>
            <TabsTrigger value="grade">학년·반 선택</TabsTrigger>
          </TabsList>

          <TabsContent value="grade" className="mt-4">
            {selectedClass ? (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedClass(null)}
                  className="gap-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  학년·반 다시 선택
                </Button>
                <div className="text-sm font-medium text-foreground">
                  {selectedClass.grade}학년 {selectedClass.class}반
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {studentsInClass.map((s) => (
                    <button
                      key={`${s.grade}-${s.class}-${s.number}`}
                      onClick={() => handleSelect(s)}
                      className="flex flex-col items-center justify-center gap-1 rounded-lg border bg-background p-3 text-center transition-colors hover:bg-accent"
                    >
                      <span className="text-xs text-muted-foreground">
                        {s.number}번
                      </span>
                      <span className="font-medium text-foreground truncate w-full">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      <th className="border bg-primary p-2 text-primary-foreground"></th>
                      {grades.map((g) => (
                        <th key={g} className="border bg-primary p-2 text-primary-foreground font-medium">
                          {g}학년
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((c) => (
                      <tr key={c}>
                        <th className="border bg-primary p-2 text-primary-foreground font-medium">
                          {c}반
                        </th>
                        {grades.map((g) => {
                          const exists = classMap.has(`${g}-${c}`);
                          return (
                            <td key={g} className="border p-1">
                              <button
                                disabled={!exists}
                                onClick={() => setSelectedClass({ grade: g, class: c })}
                                className="w-full rounded p-2 font-medium text-foreground transition-colors hover:bg-accent disabled:bg-muted disabled:text-muted-foreground/40 disabled:cursor-not-allowed"
                              >
                                {exists ? `${g}-${c}` : "-"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="name" className="mt-4 space-y-3">
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
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
