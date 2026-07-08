import type { TripStatus } from '../../services/api/tripService';

export const tripStatuses: TripStatus[] = ['Pending', 'Available', 'Full', 'InProgress', 'Completed', 'Cancelled'];

// Fixed option lists — update here if the list of campuses/areas changes.
export const TRIP_DESTINATIONS = [
  'Faculty of Engineering',
  'Faculty of Computer Science',
  'Soter Faculty Complex',
] as const;

export const TRIP_PICKUP_AREAS = [
  'Agamy',
  'Bahr (Montazah-Shatbe)',
  'Smouha',
] as const;

export function formatDateTime(value?: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// <input type="datetime-local"> needs "YYYY-MM-DDTHH:mm" with no timezone suffix.
export function toDateTimeInputValue(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Reverse of the above — local datetime-local value back to ISO for the API.
export function fromDateTimeInputValue(value: string): string {
  if (!value) return '';
  return new Date(value).toISOString();
}

export function emptyToNull(value: string): string | null {
  return value.trim() === '' ? null : value;
}

export function sortTripsByTime<T extends { estimatedTimeOfArrival: string }>(trips: T[]): T[] {
  return [...trips].sort(
    (a, b) => new Date(a.estimatedTimeOfArrival).getTime() - new Date(b.estimatedTimeOfArrival).getTime(),
  );
}

// Same-day comparison used by the Trip Finder to match an existing trip
// against the date the user picked.
export function isSameDay(isoA: string, isoB: string): boolean {
  const a = new Date(isoA);
  const b = new Date(isoB);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}