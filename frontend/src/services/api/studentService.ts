import axiosInstance from './axiosInstance';

export type StudentStatus = 'Active' | 'Inactive' | 'Graduated' | 'Suspended';

export interface StudentDto {
  studentSsn: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  enrollmentDate?: string | null;
  status: StudentStatus;
}

export type StudentListItemDto = Pick<
  StudentDto,
  'studentSsn' | 'firstName' | 'lastName' | 'email' | 'phone' | 'status' | 'enrollmentDate'
>;

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface StudentQueryParameters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: StudentStatus | '';
  enrollmentDateFrom?: string;
  enrollmentDateTo?: string;
}

export interface StudentFormPayload {
  studentSsn?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: string | null;
  address?: string | null;
  enrollmentDate?: string | null;
  status?: StudentStatus;
}

export const studentService = {
  getStudents: async (params: StudentQueryParameters): Promise<PaginatedResponse<StudentListItemDto>> => {
    const response = await axiosInstance.get<PaginatedResponse<StudentListItemDto>>('/students', { params });
    return response.data;
  },

  getStudent: async (ssn: number): Promise<StudentDto> => {
    const response = await axiosInstance.get<StudentDto>(`/students/${ssn}`);
    return response.data;
  },

  createStudent: async (payload: StudentFormPayload): Promise<StudentDto> => {
    const response = await axiosInstance.post<StudentDto>('/students', payload);
    return response.data;
  },

  updateStudent: async (ssn: number, payload: StudentFormPayload): Promise<StudentDto> => {
    const response = await axiosInstance.put<StudentDto>(`/students/${ssn}`, payload);
    return response.data;
  },

  updateStudentStatus: async (ssn: number, status: StudentStatus): Promise<{ studentSsn: number; status: StudentStatus }> => {
    const response = await axiosInstance.patch<{ studentSsn: number; status: StudentStatus }>(`/students/${ssn}/status`, { status });
    return response.data;
  },
  getCurrentStudent: async (): Promise<StudentDto> => {
  const response = await axiosInstance.get<StudentDto>("/students/me");
  return response.data;
},
};
