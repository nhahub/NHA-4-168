import axiosInstance from './axiosInstance';

export interface InstructorCourseSummaryDto {
  courseId: number;
  courseName: string;
  role?: string | null;
}

export interface InstructorListItemDto {
  instructorSsn: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  specialization?: string | null;
  rating?: number | null;
  hireDate?: string | null;
}

export interface InstructorDto extends InstructorListItemDto {
  courses: InstructorCourseSummaryDto[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface InstructorQueryParameters {
  page?: number;
  pageSize?: number;
  search?: string;
  specialization?: string;
}

export interface InstructorFormPayload {
  firstName: string;
  lastName: string;
  phone?: string | null;
  email: string;
  specialization?: string | null;
  hireDate?: string | null;
}

export const instructorService = {
  getInstructors: async (params: InstructorQueryParameters): Promise<PaginatedResponse<InstructorListItemDto>> => {
    const response = await axiosInstance.get<PaginatedResponse<InstructorListItemDto>>('/instructors', { params });
    return response.data;
  },

  getInstructor: async (ssn: number): Promise<InstructorDto> => {
    const response = await axiosInstance.get<InstructorDto>(`/instructors/${ssn}`);
    return response.data;
  },

  createInstructor: async (payload: InstructorFormPayload): Promise<InstructorDto> => {
    const response = await axiosInstance.post<InstructorDto>('/instructors', payload);
    return response.data;
  },

  updateInstructor: async (ssn: number, payload: InstructorFormPayload): Promise<InstructorDto> => {
    const response = await axiosInstance.put<InstructorDto>(`/instructors/${ssn}`, payload);
    return response.data;
  },
};
