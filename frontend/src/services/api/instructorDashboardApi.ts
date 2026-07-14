import axiosInstance from './axiosInstance';

export interface InstructorSummaryDto {
  activeCourses: number;
  totalStudents: number;
  rating: number;
}

export interface InstructorDashboardCourseDto {
  courseId: number;
  courseName: string;
  role: string | null;
  enrolledStudentsCount: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
}

export interface InstructorActivityDto {
  title: string;
  occurredAt: string;
  tone: string;
  icon: string;
}

export async function getInstructorSummary() {
  const response = await axiosInstance.get<InstructorSummaryDto>('/instructor-dashboard/summary');
  return response.data;
}

export async function getInstructorCourses() {
  const response = await axiosInstance.get<InstructorDashboardCourseDto[]>('/instructor-dashboard/courses');
  return response.data;
}

export async function getInstructorActivities(limit = 10) {
  const response = await axiosInstance.get<InstructorActivityDto[]>(
    `/instructor-dashboard/activities?limit=${limit}`
  );
  return response.data;
}

export interface InstructorCourseStudentDto {
  studentSsn: number;
  studentName: string;
  email: string;
  enrolledOn: string | null;
  status: string;
  grade: string | null;
}

export interface InstructorCoursePaymentDto {
  courseId: number;
  courseName: string;
  isActive: boolean;
  enrolledStudentsCount: number;
  courseRevenue: number;
  earnings: number;
}

export interface InstructorPaymentSummaryDto {
  commissionRatePercent: number;
  totalCoursesTaught: number;
  activeCoursesTaught: number;
  totalRevenue: number;
  totalEarned: number;
  activeCoursesEarnings: number;
  courses: InstructorCoursePaymentDto[];
}

export async function getInstructorCourseStudents(courseId: number) {
  const response = await axiosInstance.get<InstructorCourseStudentDto[]>(
    `/instructor-dashboard/courses/${courseId}/students`
  );
  return response.data;
}

export async function getInstructorPayments() {
  const response = await axiosInstance.get<InstructorPaymentSummaryDto>('/instructor-dashboard/payments');
  return response.data;
}
