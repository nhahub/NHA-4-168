import axiosInstance from './axiosInstance';
import type { TripDto } from './tripService';

export interface DriverSummaryDto {
  totalTrips: number;
  completedTrips: number;
  activeTrips: number;
}

export interface DriverActivityDto {
  title: string;
  occurredAt: string;
  tone: string;
  icon: string;
}

export async function getDriverSummary() {
  const response = await axiosInstance.get<DriverSummaryDto>('/driver-dashboard/summary');
  return response.data;
}

export async function getDriverTrips() {
  const response = await axiosInstance.get<TripDto[]>('/driver-dashboard/trips');
  return response.data;
}

export async function getDriverActivities(limit = 10) {
  const response = await axiosInstance.get<DriverActivityDto[]>(
    `/driver-dashboard/activities?limit=${limit}`
  );
  return response.data;
}
