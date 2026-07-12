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
