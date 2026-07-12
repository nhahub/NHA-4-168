import type { StudentStatus } from '../../services/api/studentService';
import { studentStatuses } from './studentUtils';

interface StatusChangeDialogProps {
  open: boolean;
  currentStatus: StudentStatus;
  selectedStatus: StudentStatus;
  studentName: string;
  isSubmitting: boolean;
  error?: string | null;
  onSelectedStatusChange: (status: StudentStatus) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function StatusChangeDialog({
  open,
  currentStatus,
  selectedStatus,
  studentName,
  isSubmitting,
  error,
  onSelectedStatusChange,
  onCancel,
  onConfirm,
}: StatusChangeDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-modal">
        <h2 className="text-title-sm font-semibold text-on-surface">Change Status</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          {studentName} is currently {currentStatus}.
        </p>

        <label className="mt-5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          New Status
          <select
            value={selectedStatus}
            onChange={(event) => onSelectedStatusChange(event.target.value as StudentStatus)}
            className="mt-2 w-full rounded-lg border border-input-border bg-surface-lowest px-3 py-2 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          >
            {studentStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        {error ? <p className="mt-4 text-body-sm text-error">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-card-border px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save Status'}
          </button>
        </div>
      </div>
    </div>
  );
}
