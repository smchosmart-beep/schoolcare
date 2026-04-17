export interface Student {
  grade: number;
  class: string;
  number: number;
  name: string;
}

const STORAGE_KEY = "health-journal-students";

export function saveStudents(students: Student[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

export function loadStudents(): Student[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function getGrades(students: Student[]): number[] {
  return [...new Set(students.map((s) => s.grade))].sort((a, b) => a - b);
}

export function getClasses(students: Student[], grade: number): string[] {
  return [...new Set(students.filter((s) => s.grade === grade).map((s) => s.class))].sort((a, b) => a.localeCompare(b));
}

export function getStudentsInClass(students: Student[], grade: number, cls: string): Student[] {
  return students
    .filter((s) => s.grade === grade && s.class === cls)
    .sort((a, b) => a.number - b.number);
}

export function addStudent(student: Student): { success: boolean; message: string } {
  const students = loadStudents();
  const duplicate = students.find(
    (s) => s.grade === student.grade && s.class === student.class && s.number === student.number
  );
  if (duplicate) {
    return { success: false, message: `${student.grade}학년 ${student.class}반 ${student.number}번은 이미 등록되어 있습니다 (${duplicate.name}).` };
  }
  students.push(student);
  saveStudents(students);
  return { success: true, message: `${student.name} 학생을 추가했습니다.` };
}

const CLASS_ORDER_KEY = "health-journal-class-order";

export function loadClassOrder(): string[] {
  const data = localStorage.getItem(CLASS_ORDER_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveClassOrder(order: string[]) {
  localStorage.setItem(CLASS_ORDER_KEY, JSON.stringify(order));
}

export function clearClassOrder() {
  localStorage.removeItem(CLASS_ORDER_KEY);
}

export function sortClasses(classes: string[]): string[] {
  const saved = loadClassOrder();
  return [...classes].sort((a, b) => {
    const ia = saved.indexOf(a);
    const ib = saved.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.localeCompare(b, "ko");
  });
}

export function removeStudent(grade: number, cls: string, number: number): Student[] {
  const students = loadStudents();
  const filtered = students.filter(
    (s) => !(s.grade === grade && s.class === cls && s.number === number)
  );
  saveStudents(filtered);
  return filtered;
}
