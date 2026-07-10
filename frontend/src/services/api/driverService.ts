import axiosInstance from './axiosInstance';

export type DriverStatus = 'Active' | 'Inactive' | 'Suspended';

export interface DriverDto {
  driverSsn: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  licenseNumber: string;
  carModel: string | null;
  carPlate: string | null;
  carYear: number;
  userId: string | null;
  status: DriverStatus;
}

export interface DriverListItemDto {
  driverSsn: number;
  firstName: string;
  lastName: string;
  carModel: string | null;
}

export interface DriverFormPayload {
  driverSsn: number;
  firstName: string;
  lastName: string;
  phone: string | null;
  licenseNumber: string;
  carModel: string | null;
  carPlate: string | null;
  carYear: number;
  userId: string | null;
  status?: DriverStatus;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
}

function normalizeDriver(value: unknown): DriverDto | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  for (const key of ['data', 'result', 'item', 'value']) {
    const nested = candidate[key];
    if (nested && typeof nested === 'object') {
      const normalizedNested = normalizeDriver(nested);
      if (normalizedNested) {
        return normalizedNested;
      }
    }
  }

  const hasDriverShape = ['driverSsn', 'firstName', 'lastName', 'licenseNumber'].some((key) => key in candidate);
  if (!hasDriverShape) {
    return null;
  }

  const statusValue = typeof candidate.status === 'string' ? candidate.status : 'Active';

  return {
    ...(candidate as Omit<DriverDto, 'status'>),
    status: statusValue as DriverDto['status'],
  } as DriverDto;
}

function normalizeDrivers(value: unknown): DriverDto[] {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeDriver(item)).filter((item): item is DriverDto => Boolean(item));
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const candidate = value as Record<string, unknown>;

  for (const key of ['data', 'result', 'items', 'drivers', 'value']) {
    const nested = candidate[key];
    if (Array.isArray(nested)) {
      return nested.map((item) => normalizeDriver(item)).filter((item): item is DriverDto => Boolean(item));
    }

    if (nested && typeof nested === 'object') {
      const normalizedNested = normalizeDrivers(nested);
      if (normalizedNested.length > 0) {
        return normalizedNested;
      }
    }
  }

  const normalizedSingle = normalizeDriver(value);
  return normalizedSingle ? [normalizedSingle] : [];
}

function getPaginationMeta(payload: unknown, fallback: { page: number; pageSize: number; totalPages: number; totalCount: number }) {
  if (!payload || typeof payload !== 'object') {
    return fallback;
  }

  const candidate = payload as Record<string, unknown>;
  return {
    page: typeof candidate.page === 'number' ? candidate.page : fallback.page,
    pageSize: typeof candidate.pageSize === 'number' ? candidate.pageSize : fallback.pageSize,
    totalPages: typeof candidate.totalPages === 'number' ? candidate.totalPages : fallback.totalPages,
    totalCount: typeof candidate.totalCount === 'number' ? candidate.totalCount : fallback.totalCount,
  };
}

export const driverService = {
  // 1️⃣ GET /api/Drivers (جلب كل السواقين مع الفلترة والـ Pagination)
  getDrivers: async (params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: DriverStatus;
  }): Promise<PaginatedResponse<DriverDto>> => {
    const response = await axiosInstance.get<unknown>('/Drivers', { params });
    const payload = response.data as unknown;
    const data = normalizeDrivers(payload);
    const meta = getPaginationMeta(payload, {
      page: params.page,
      pageSize: params.pageSize,
      totalPages: 1,
      totalCount: data.length,
    });

    return {
      data,
      page: meta.page,
      pageSize: meta.pageSize,
      totalPages: meta.totalPages,
      totalCount: meta.totalCount,
    };
  },

  // 2️⃣ POST /api/Drivers (إضافة سواق جديد)
  createDriver: async (payload: DriverFormPayload): Promise<DriverDto> => {
    const response = await axiosInstance.post<unknown>('/Drivers', payload);
    const normalizedDriver = normalizeDriver(response.data);
    return normalizedDriver ?? (payload as unknown as DriverDto);
  },

  // 3️⃣ GET /api/Drivers/{ssn} (تفاصيل سواق معين)
  getDriverBySsn: async (ssn: number): Promise<DriverDto> => {
    const response = await axiosInstance.get<unknown>(`/Drivers/${ssn}`);
    const normalizedDriver = normalizeDriver(response.data);
    return normalizedDriver ?? ({ driverSsn: ssn } as DriverDto);
  },

  // 4️⃣ PUT /api/Drivers/{ssn} (تعديل بيانات السواق)
  updateDriver: async (ssn: number, payload: DriverFormPayload): Promise<DriverDto> => {
    const response = await axiosInstance.put<unknown>(`/Drivers/${ssn}`, payload);
    const normalizedDriver = normalizeDriver(response.data);
    return normalizedDriver ?? ({ ...payload, driverSsn: ssn, status: 'Active' } as DriverDto);
  },

  // 5️⃣ DELETE /api/Drivers/{ssn} (حذف سواق من النظام)
  deleteDriver: async (ssn: number): Promise<void> => {
    await axiosInstance.delete(`/Drivers/${ssn}`);
  },
};