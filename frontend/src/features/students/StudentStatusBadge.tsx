import type { StudentStatus } from '../../services/api/studentService';

const statusClasses: Record<StudentStatus, string> = {
  Active: 'bg-status-success-container text-status-success',
  Inactive: 'bg-status-neutral-container text-status-neutral',
  Graduated: 'bg-secondary-fixed text-secondary',
  Suspended: 'bg-error-container text-error',
};

interface StudentStatusBadgeProps {
  status: StudentStatus;
}

export function StudentStatusBadge({ status }: StudentStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${statusClasses[status]}`}>
      {status}
    </span>
  );
}
