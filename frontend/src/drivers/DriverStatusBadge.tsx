import type { DriverStatus } from '../services/api/driverService';

const statusClasses: Record<DriverStatus, string> = {
  Active: 'bg-status-success-container text-status-success',
  Inactive: 'bg-status-neutral-container text-status-neutral',
  Suspended: 'bg-error-container text-error',
};

interface DriverStatusBadgeProps {
  status: DriverStatus;
}

export function DriverStatusBadge({ status }: DriverStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${statusClasses[status]}`}>
      {status}
    </span>
  );
}