import type { AxiosError } from 'axios';
import type { CourseLevel, InstructorAssignmentRole } from '../../services/api/courseService';

export const courseLevels: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced'];
export const instructorAssignmentRoles: InstructorAssignmentRole[] = ['Lead', 'Assistant', 'Guest'];

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

export function formatFee(fee?: number | null, isPaid?: boolean) {
  if (!isPaid || fee === null || fee === undefined) {
    return 'Free';
  }

  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(fee);
}

/**
 * TEMPORARY FRONTEND-ONLY MOCK.
 * The backend does not expose a course rating field yet. This produces a
 * deterministic, plausible-looking rating (3.5 - 5.0) from the courseId so
 * the UI has something to show. Replace with the real value from the API
 * (e.g. course.rating) once the backend adds it.
 */
export function getMockCourseRating(courseId: number) {
  const fractional = (courseId * 37) % 15; // 0-14
  return Number((3.5 + fractional / 10).toFixed(1));
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
