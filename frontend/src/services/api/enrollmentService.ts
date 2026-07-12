import axiosInstance from "./axiosInstance";

export interface EnrollmentDto {
  enrollmentId: number;
  studentSsn: number;
  studentName: string;

  courseId: number;
  courseName: string;

  enrolledOn: string;
  grade: string | null;
  status: string;
  paymentStatus: string | null;
}

export interface CreateEnrollmentDto {
  studentSsn: number;
  courseId: number;
}

export interface UpdateEnrollmentStatusDto {
  status: string;
  grade?: string;
}

const enrollmentService = {
  getAll: async (): Promise<EnrollmentDto[]> => {
  const response = await axiosInstance.get("/enrollments");

  console.log("API Response:", response.data);

  return response.data;
},

  getById: async (id: number): Promise<EnrollmentDto> => {
    const response = await axiosInstance.get<EnrollmentDto>(`/enrollments/${id}`);
    return response.data;
  },

  create: async (data: CreateEnrollmentDto): Promise<EnrollmentDto> => {
    const response = await axiosInstance.post<EnrollmentDto>(
      "/enrollments",
      data
    );
    return response.data;
  },

  updateStatus: async (
    id: number,
    data: UpdateEnrollmentStatusDto
  ): Promise<void> => {
    await axiosInstance.patch(`/enrollments/${id}/status`, data);
  },
};

export default enrollmentService;