import axiosInstance from './axiosInstance';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type InstructorAssignmentRole = 'Lead' | 'Assistant' | 'Guest';

export interface CourseInstructorSummaryDto {
  instructorSsn: number;
  fullName: string;
  role?: string | null;
  assignedOn?: string | null;
}

export interface CourseListItemDto {
  courseId: number;
  courseName: string;
  level?: CourseLevel | null;
  fee?: number | null;
  isPaid: boolean;
  startDate?: string | null;
  endDate?: string | null;
  maxCapacity?: number | null;
  enrolledCount: number;
  availableSeats?: number | null;
  isActive: boolean;
}

export interface CourseDto extends CourseListItemDto {
  description?: string | null;
  instructors: CourseInstructorSummaryDto[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CourseQueryParameters {
  page?: number;
  pageSize?: number;
  search?: string;
  level?: CourseLevel | '';
  isPaid?: boolean;
  startDateFrom?: string;
  hasCapacity?: boolean;
}

export interface CourseFormPayload {
  courseName: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  maxCapacity?: number | null;
  fee?: number | null;
  level?: CourseLevel | '' | null;
  isPaid: boolean;
}

export interface AssignInstructorPayload {
  instructorSsn: number;
  role?: InstructorAssignmentRole | '';
}

export interface CourseInstructorResponse {
  courseId: number;
  instructorSsn: number;
  role?: string | null;
  assignedOn?: string | null;
}

export const courseService = {
  getCourses: async (params: CourseQueryParameters): Promise<PaginatedResponse<CourseListItemDto>> => {
    const response = await axiosInstance.get<PaginatedResponse<CourseListItemDto>>('/courses', { params });
    return response.data;
  },

  getCourse: async (courseId: number): Promise<CourseDto> => {
    const response = await axiosInstance.get<CourseDto>(`/courses/${courseId}`);
    return response.data;
  },

  createCourse: async (payload: CourseFormPayload): Promise<CourseDto> => {
    const response = await axiosInstance.post<CourseDto>('/courses', payload);
    return response.data;
  },

  updateCourse: async (courseId: number, payload: CourseFormPayload): Promise<CourseDto> => {
    const response = await axiosInstance.put<CourseDto>(`/courses/${courseId}`, payload);
    return response.data;
  },

  deactivateCourse: async (courseId: number): Promise<void> => {
    await axiosInstance.delete(`/courses/${courseId}`);
  },

  assignInstructor: async (courseId: number, payload: AssignInstructorPayload): Promise<CourseInstructorResponse> => {
    const response = await axiosInstance.post<CourseInstructorResponse>(`/courses/${courseId}/instructors`, payload);
    return response.data;
  },

  removeInstructor: async (courseId: number, instructorSsn: number): Promise<void> => {
    await axiosInstance.delete(`/courses/${courseId}/instructors/${instructorSsn}`);
  },
};
