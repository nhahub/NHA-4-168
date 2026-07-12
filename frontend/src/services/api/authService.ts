import axiosInstance from './axiosInstance';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      email: string;
      roles: string[];
      firstName?: string | null;
      lastName?: string | null;
      studentSsn?: number | null;
    };
  };
}

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    studentSsn: number;
    phone: string;
    dateOfBirth: string;
  }): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      '/auth/register',
      userData
    );
    return response.data;
  },
};
