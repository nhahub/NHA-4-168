import type { AxiosError } from 'axios';
import type { StudentStatus } from '../../services/api/studentService';

export const studentStatuses: StudentStatus[] = ['Active', 'Inactive', 'Graduated', 'Suspended'];

export function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(new Date(value));
}

export function toDateInputValue(value?: string | null) {
  if (!value) {
    return '';
  }

  return value.slice(0, 10);
}

export function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getApiErrorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
  const data = axiosError.response?.data;

  if (data?.errors) {
    const firstError = Object.values(data.errors).flat()[0];
    if (firstError) {
      return firstError;
    }
  }

  return data?.message || axiosError.message || 'Request failed.';
}
