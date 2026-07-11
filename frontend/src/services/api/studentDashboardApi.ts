import axiosInstance from './axiosInstance';

export interface StudentSummaryDto {
  activeCourses: number;
  activeRides: number;
  pendingPayments: number;
  status: string;
}

export async function getStudentSummary() {
  const response = await axiosInstance.get<StudentSummaryDto>('/student-dashboard/summary');
  return response.data;
}
export interface StudentCourseDto {
  courseId: string;
  title: string;
  instructorName: string;
  startDate: string;
  endDate: string;
}

export async function getStudentCourses() {
  const response = await axiosInstance.get<StudentCourseDto[]>('/student-dashboard/courses');
  return response.data;
}
