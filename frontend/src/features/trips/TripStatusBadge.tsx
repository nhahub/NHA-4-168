import { normalizeTripStatus, type TripStatus } from '../../services/api/tripService';

const statusStyles: Record<TripStatus, string> = {
  Pending: 'bg-status-neutral-container text-status-neutral',
  Available: 'bg-status-success-container text-status-success',
  Full: 'bg-status-warning-container text-status-warning',
  InProgress: 'bg-status-info-container text-status-info',
  Completed: 'bg-status-neutral-container text-status-neutral',
  Cancelled: 'bg-status-danger-container text-status-danger',
};

interface TripStatusBadgeProps {
  status: TripStatus | string;
}

export function TripStatusBadge({ status }: TripStatusBadgeProps) {
  const normalizedStatus = normalizeTripStatus(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-label-caps uppercase ${statusStyles[normalizedStatus] ?? statusStyles.Available}`}
    >
      {normalizedStatus}
    </span>
  );
}
