export interface DashboardSummaryDto {
  totalStudents: number;
  activeEnrollments: number;
  pendingPayments: number;
  pendingServiceRequests: number;
  activeRides: number;
  totalRevenue: number;
}

export interface EnrollmentTrendDto {
  date: string;
  enrollments: number;
  completedEnrollments: number;
}

export interface StudentApplicationDto {
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  appliedOn: string | null;
  status: string;
}

export interface ActivityLogDto {
  title: string;
  occurredAt: string;
  tone: 'info' | 'success' | 'danger' | 'neutral';
  icon: string;
}