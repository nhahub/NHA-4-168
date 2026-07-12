export interface Enrollment {
  id: number;
  studentName: string;
  studentId: string;
  initials: string;

  course: string;
  semester: string;

  enrollmentDate: string;

  status: "Active" | "Completed" | "Withdrawn";

  grade: string;
}

export interface DashboardStat {
  id: number;

  title: string;

  value: string;

  change: string;

  icon: string;

  color: string;
}