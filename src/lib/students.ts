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
