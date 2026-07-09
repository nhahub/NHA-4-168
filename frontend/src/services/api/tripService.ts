import axiosInstance from './axiosInstance';

export type TripStatus = 'Pending' | 'Available' | 'Full' | 'InProgress' | 'Completed' | 'Cancelled';

export const MAX_TRIP_SEATS = 14;

export const tripStatusOptions: TripStatus[] = ['Pending', 'Available', 'Full', 'InProgress', 'Completed', 'Cancelled'];

export function normalizeTripStatus(value: string | null | undefined): TripStatus {
  if (!value) return 'Pending';

  const normalizedValue = value.toString().trim().toLowerCase();
  const statusMap: Record<string, TripStatus> = {
    pending: 'Pending',
    available: 'Available',
    full: 'Full',
    inprogress: 'InProgress',
    'in-progress': 'InProgress',
    in_progress: 'InProgress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    canceled: 'Cancelled',
  };

  return statusMap[normalizedValue] ?? 'Pending';
}

export interface TripStudentDto {
  studentSsn: number;
  studentName: string;
  joinedAt: string;
}

export interface TripDto {
  tripId: number;
  driverSsn: number;
  driverName: string;
  destination: string;
  pickupArea: string;
  estimatedTimeOfArrival: string;
  status: TripStatus;
  price: number;
  seatsTaken: number;
  maxSeats: number;
  students: TripStudentDto[];
}

// NOTE: confirm with backend which fields are actually required on create.
// driverName / status / seatsTaken / students look server-derived from
// driverSsn — sending them is harmless if the API ignores extras, but they
// may not be necessary.
export interface TripFormPayload {
  driverSsn: number;
  destination: string;
  pickupArea: string;
  estimatedTimeOfArrival: string;
  price: number;
  maxSeats: number;
  // Only relevant on update — there's no dedicated PATCH /status endpoint,
  // so status changes go through the same PUT /api/trips/{id} call.
  status?: TripStatus;
}

export interface AddStudentToTripPayload {
  studentSsn: number;
}

export interface TripQueryParameters {
  destination?: string;
  pickupArea?: string;
  status?: TripStatus | '';
}

function getApiErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: { data?: { error?: string } } }).response?.data?.error === 'string'
  ) {
    return (error as { response: { data: { error: string } } }).response.data.error;
  }
  return 'Something went wrong. Please try again.';
}

export const tripService = {
  // GET /api/trips — returns a plain array, not a paginated envelope.
  getTrips: async (): Promise<TripDto[]> => {
    const response = await axiosInstance.get<TripDto[]>('/trips');
    return response.data.map((trip) => ({ ...trip, status: normalizeTripStatus(trip.status) }));
  },

  getTrip: async (tripId: number): Promise<TripDto> => {
    const response = await axiosInstance.get<TripDto>(`/trips/${tripId}`);
    return { ...response.data, status: normalizeTripStatus(response.data.status) };
  },

  getTripsByDriver: async (driverSsn: number): Promise<TripDto[]> => {
    const response = await axiosInstance.get<TripDto[]>(`/trips/driver/${driverSsn}`);
    return response.data.map((trip) => ({ ...trip, status: normalizeTripStatus(trip.status) }));
  },

  getTripsByStudent: async (studentSsn: number): Promise<TripDto[]> => {
    const response = await axiosInstance.get<TripDto[]>(`/trips/student/${studentSsn}`);
    return response.data.map((trip) => ({ ...trip, status: normalizeTripStatus(trip.status) }));
  },

  createTrip: async (payload: TripFormPayload): Promise<TripDto> => {
    const response = await axiosInstance.post<TripDto>('/trips', payload);
    return { ...response.data, status: normalizeTripStatus(response.data.status) };
  },

  updateTrip: async (tripId: number, payload: TripFormPayload): Promise<TripDto> => {
    const normalizedPayload: TripFormPayload = {
      ...payload,
      ...(payload.status ? { status: normalizeTripStatus(payload.status) } : {}),
    };
    const response = await axiosInstance.put<TripDto>(`/trips/${tripId}`, normalizedPayload);
    return { ...response.data, status: normalizeTripStatus(response.data.status) };
  },

  deleteTrip: async (tripId: number): Promise<void> => {
    await axiosInstance.delete(`/trips/${tripId}`);
  },

  addStudentToTrip: async (tripId: number, payload: AddStudentToTripPayload): Promise<TripDto> => {
    const response = await axiosInstance.post<TripDto>(`/trips/${tripId}/students`, payload);
    return response.data;
  },

  removeStudentFromTrip: async (tripId: number, studentSsn: number): Promise<void> => {
    await axiosInstance.delete(`/trips/${tripId}/students/${studentSsn}`);
  },
};

export { getApiErrorMessage };