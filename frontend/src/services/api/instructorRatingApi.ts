import axiosInstance from './axiosInstance';

export interface InstructorToRateDto {
  instructorSsn: number;
  firstName: string;
  lastName: string;
  courses: string[];
  myScore: number | null;
}

export interface InstructorRatingDto {
  studentSsn: number;
  instructorSsn: number;
  studentName: string;
  score: number;
  comment: string | null;
  ratedAt: string;
}

export interface CreateInstructorRatingDto {
  instructorSsn: number;
  score: number;
  comment?: string | null;
}

export const instructorRatingApi = {
  getEligible: async (): Promise<InstructorToRateDto[]> => {
    const response = await axiosInstance.get<InstructorToRateDto[]>('/instructor-ratings/eligible');
    return response.data;
  },

  submit: async (dto: CreateInstructorRatingDto): Promise<InstructorRatingDto> => {
    const response = await axiosInstance.post<InstructorRatingDto>('/instructor-ratings', dto);
    return response.data;
  },

  getMine: async (): Promise<InstructorRatingDto[]> => {
    const response = await axiosInstance.get<InstructorRatingDto[]>('/instructor-ratings/mine');
    return response.data;
  },

  getByInstructor: async (ssn: number): Promise<InstructorRatingDto[]> => {
    const response = await axiosInstance.get<InstructorRatingDto[]>(`/instructor-ratings/instructor/${ssn}`);
    return response.data;
  },
};
