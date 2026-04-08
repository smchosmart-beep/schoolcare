import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { loadStudents, getGrades, getClasses, getStudentsInClass, type Student } from "@/lib/students";
import { toast } from "sonner";
import { Heart, Stethoscope, ArrowLeft, Users, Clock, Settings } from "lucide-react";
import StudentUpload from "@/components/admin/StudentUpload";

type KioskStep = "home" | "selectGrade" | "selectClass" | "selectStudent" | "selfTreatment" | "inputTemperature";
type VisitType = "self_treatment" | "teacher_visit";

interface QueueItem {
  id: string;
  student_name: string;
  student_grade: number;
  student_class: string;
  student_number: number;
  created_at: string;
}

interface TreatmentOption {
  id: string;
  name: string;
  icon: string;
}

export default function Kiosk() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<KioskStep>("home");
  const [visitType, setVisitType] = useState<VisitType>("self_treatment");
  const [selectedGrade, setSelectedGrade] = useState<number>(0);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [treatmentOptions, setTreatmentOptions] = useState<TreatmentOption[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentOption | null>(null);
  const [temperatureInput, setTemperatureInput] = useState("");

  const teacherId = user?.id || "";

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    setStudents(loadStudents());
  }, []);

  // Fetch queue
  const fetchQueue = useCallback(async () => {
    if (!teacherId) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from("waiting_queue")
      .select("*")
      .eq("teacher_id", teacherId)
      .gte("created_at", today.toISOString())
      .order("created_at", { ascending: true });
    if (data) setQueue(data);
  }, [teacherId]);

  // Fetch treatment options
  const fetchOptions = useCallback(async () => {
    if (!teacherId) return;
    const { data } = await supabase
      .from("self_treatment_options")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("sort_order", { ascending: true });
    if (data) setTreatmentOptions(data);
  }, [teacherId]);

  useEffect(() => {
    fetchQueue();
    fetchOptions();
  }, [fetchQueue, fetchOptions]);

  // Realtime subscription for queue
  useEffect(() => {
    if (!teacherId) return;
    const channel = supabase
      .channel("kiosk-queue")
      .on("postgres_changes", { event: "*", schema: "public", table: "waiting_queue" }, () => {
        fetchQueue();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [teacherId, fetchQueue]);

  const handleVisitType = (type: VisitType) => {
    setVisitType(type);
    setStep("selectGrade");
  };

  const handleGrade = (grade: number) => {
    setSelectedGrade(grade);
    setStep("selectClass");
  };

  const handleClass = (cls: string) => {
    setSelectedClass(cls);
    setStep("selectStudent");
  };

  const handleStudent = (student: Student) => {
    setSelectedStudent(student);
    if (visitType === "self_treatment") {
      setStep("selfTreatment");
    } else {
      submitTeacherVisit(student);
    }
  };

  const submitTeacherVisit = async (student: Student) => {
    await supabase.from("waiting_queue").insert({
      teacher_id: teacherId,
      student_grade: student.grade,
      student_class: student.class,
      student_number: student.number,
      student_name: student.name,
    });
    toast.success(`${student.name} 학생이 대기열에 추가되었습니다.`);
    resetToHome();
  };

  const handleSelfTreatment = async (option: TreatmentOption) => {
    if (!selectedStudent) return;
    if (option.icon === "🌡️") {
      setSelectedTreatment(option);
      setTemperatureInput("");
      setStep("inputTemperature");
      return;
    }
    await supabase.from("visits").insert({
      teacher_id: teacherId,
      student_grade: selectedStudent.grade,
      student_class: selectedStudent.class,
      student_number: selectedStudent.number,
      student_name: selectedStudent.name,
      visit_type: "self_treatment",
      self_treatment_item: option.name,
      status: "completed",
    });
    toast.success(`${selectedStudent.name} 학생 - ${option.name} 처리 완료!`);
    resetToHome();
  };

  const submitTemperature = async (skipTemp: boolean) => {
    if (!selectedStudent || !selectedTreatment) return;
    await supabase.from("visits").insert({
      teacher_id: teacherId,
      student_grade: selectedStudent.grade,
      student_class: selectedStudent.class,
      student_number: selectedStudent.number,
      student_name: selectedStudent.name,
      visit_type: "self_treatment",
      self_treatment_item: selectedTreatment.name,
      temperature: skipTemp ? null : temperatureInput || null,
      status: "completed",
    });
    toast.success(`${selectedStudent.name} 학생 - ${selectedTreatment.name} 처리 완료!`);
    resetToHome();
  };

  const handleTempKeypad = (key: string) => {
    if (key === "backspace") {
      setTemperatureInput((prev) => prev.slice(0, -1));
      return;
    }
    if (key === "." && temperatureInput.includes(".")) return;
    if (temperatureInput.length >= 5) return;
    setTemperatureInput((prev) => prev + key);
  };

  const resetToHome = () => {
    setStep("home");
    setSelectedGrade(0);
    setSelectedClass("");
    setSelectedStudent(null);
  };

  const goBack = () => {
    switch (step) {
      case "selectGrade": resetToHome(); break;
      case "selectClass": setStep("selectGrade"); break;
      case "selectStudent": setStep("selectClass"); break;
      case "selfTreatment": setStep("selectStudent"); break;
      case "inputTemperature": setStep("selfTreatment"); break;
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-primary">
          <Heart className="h-12 w-12" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  // 학생 명단이 없으면 업로드 UI 표시
  if (students.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <header className="flex items-center justify-between border-b bg-primary px-6 py-4">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary-foreground" />
            <h1 className="text-xl font-bold text-primary-foreground">보건실 키오스크</h1>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 rounded-lg bg-primary-foreground/20 px-3 py-2 text-sm text-primary-foreground hover:bg-primary-foreground/30"
          >
            <Settings className="h-4 w-4" />
            관리자 페이지
          </button>
        </header>
        <div className="mx-auto w-full max-w-2xl p-6">
          <div className="mb-6 rounded-2xl border border-primary/20 bg-accent p-6 text-center">
            <Heart className="mx-auto mb-3 h-12 w-12 text-primary" />
            <h2 className="text-xl font-bold text-foreground">학생 명단을 먼저 업로드해주세요</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              키오스크를 사용하려면 이 기기에 학생 명단이 필요합니다.
            </p>
          </div>
          <StudentUpload onUploadComplete={() => setStudents(loadStudents())} />
        </div>
      </div>
    );
  }

  // HOME SCREEN
  if (step === "home") {
    return (
      <div className="flex min-h-screen flex-col bg-background touch-action-manipulation">
        {/* Header */}
        <header className="flex items-center justify-between border-b bg-primary px-6 py-4">
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary-foreground" />
            <h1 className="text-xl font-bold text-primary-foreground">보건실</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-primary-foreground/20 px-4 py-2">
              <Users className="h-5 w-5 text-primary-foreground" />
              <span className="text-lg font-semibold text-primary-foreground">대기 {queue.length}명</span>
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="rounded-lg bg-primary-foreground/20 p-2 text-primary-foreground hover:bg-primary-foreground/30"
              title="관리자 페이지"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col lg:flex-row">
          {/* Main buttons */}
          <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
            <p className="text-lg text-muted-foreground">어떤 도움이 필요한가요?</p>
            <div className="grid w-full max-w-lg gap-6">
              <button
                onClick={() => handleVisitType("self_treatment")}
                className="group flex flex-col items-center gap-4 rounded-3xl border-2 border-primary/20 bg-card p-10 shadow-sm transition-all hover:border-primary hover:shadow-lg active:scale-[0.98]"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent">
                  <Heart className="h-10 w-10 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">스스로 치료</span>
                <span className="text-sm text-muted-foreground">간단한 처치를 직접 할 수 있어요</span>
              </button>
              <button
                onClick={() => handleVisitType("teacher_visit")}
                className="group flex flex-col items-center gap-4 rounded-3xl border-2 border-secondary/30 bg-card p-10 shadow-sm transition-all hover:border-secondary hover:shadow-lg active:scale-[0.98]"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/20">
                  <Stethoscope className="h-10 w-10 text-secondary-foreground" />
                </div>
                <span className="text-2xl font-bold text-foreground">보건선생님 만나기</span>
                <span className="text-sm text-muted-foreground">선생님의 도움이 필요해요</span>
              </button>
            </div>
          </div>

          {/* Waiting queue sidebar */}
          {queue.length > 0 && (
            <div className="w-full border-t bg-card p-6 lg:w-80 lg:border-l lg:border-t-0">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
                <Clock className="h-5 w-5 text-primary" />
                대기자 명단
              </h2>
              <div className="space-y-2">
                {queue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border bg-background p-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{item.student_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.student_grade}학년 {item.student_class}반 {item.student_number}번
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // GRADE/CLASS/STUDENT SELECTION & SELF TREATMENT
  const grades = getGrades(students);
  const classes = selectedGrade ? getClasses(students, selectedGrade) : [];
  const classStudents = selectedGrade && selectedClass ? getStudentsInClass(students, selectedGrade, selectedClass) : [];

  const stepTitle = {
    selectGrade: "학년을 선택하세요",
    selectClass: `${selectedGrade}학년 - 반을 선택하세요`,
    selectStudent: `${selectedGrade}학년 ${selectedClass}반 - 이름을 선택하세요`,
    selfTreatment: `${selectedStudent?.name} 학생 - 치료를 선택하세요`,
    inputTemperature: "체온을 입력하세요",
    home: "",
  }[step];

  return (
    <div className="flex min-h-screen flex-col bg-background touch-action-manipulation">
      <header className="flex items-center gap-4 border-b bg-primary px-6 py-4">
        <button onClick={goBack} className="rounded-xl p-2 text-primary-foreground hover:bg-primary-foreground/20">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-primary-foreground">{stepTitle}</h1>
      </header>

      <div className="flex-1 p-6">
        {step === "selectGrade" && (
          <div className="mx-auto grid max-w-2xl grid-cols-3 gap-4">
            {grades.map((g) => (
              <button
                key={g}
                onClick={() => handleGrade(g)}
                className="flex h-24 items-center justify-center rounded-2xl border-2 border-primary/20 bg-card text-2xl font-bold text-foreground shadow-sm transition-all hover:border-primary hover:shadow-md active:scale-[0.97]"
              >
                {g}학년
              </button>
            ))}
          </div>
        )}

        {step === "selectClass" && (
          <div className="mx-auto grid max-w-2xl grid-cols-4 gap-4">
            {classes.map((c) => (
              <button
                key={c}
                onClick={() => handleClass(c)}
                className="flex h-24 items-center justify-center rounded-2xl border-2 border-primary/20 bg-card text-2xl font-bold text-foreground shadow-sm transition-all hover:border-primary hover:shadow-md active:scale-[0.97]"
              >
                {c}반
              </button>
            ))}
          </div>
        )}

        {step === "selectStudent" && (
          <div className="mx-auto grid max-w-3xl grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6">
            {classStudents.map((s) => (
              <button
                key={`${s.number}-${s.name}`}
                onClick={() => handleStudent(s)}
                className="flex flex-col items-center justify-center rounded-2xl border-2 border-primary/20 bg-card p-4 shadow-sm transition-all hover:border-primary hover:shadow-md active:scale-[0.97]"
              >
                <span className="text-sm text-muted-foreground">{s.number}번</span>
                <span className="text-lg font-bold text-foreground">{s.name}</span>
              </button>
            ))}
          </div>
        )}

        {step === "selfTreatment" && (
          <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-3">
            {treatmentOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelfTreatment(opt)}
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-primary/20 bg-card p-8 shadow-sm transition-all hover:border-primary hover:shadow-md active:scale-[0.97]"
              >
                <span className="text-4xl">{opt.icon}</span>
                <span className="text-lg font-bold text-foreground">{opt.name}</span>
              </button>
            ))}
            {treatmentOptions.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-12">
                <p className="text-lg">설정된 치료 항목이 없습니다.</p>
                <p className="text-sm mt-2">보건교사가 관리 페이지에서 항목을 추가해주세요.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}