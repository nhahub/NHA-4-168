import axiosInstance from './axiosInstance';
import type { ActivityLogDto, DashboardSummaryDto, EnrollmentTrendDto, StudentApplicationDto } from '../../types/dashboard';

export async function getDashboardSummary() {
  const response = await axiosInstance.get<DashboardSummaryDto>('/dashboard/summary');
  return response.data;
}

export async function getEnrollmentTrends(days: number) {
  const response = await axiosInstance.get<EnrollmentTrendDto[]>('/dashboard/enrollment-trends', {
    params: { days },
  });
  return response.data;
}

export async function getRecentApplications(limit: number) {
  const response = await axiosInstance.get<StudentApplicationDto[]>('/dashboard/applications', {
    params: { limit },
  });
  return response.data;
}

export async function getRecentActivities(limit: number) {
  const response = await axiosInstance.get<ActivityLogDto[]>('/dashboard/activities', {
    params: { limit },
  });
  return response.data;
}