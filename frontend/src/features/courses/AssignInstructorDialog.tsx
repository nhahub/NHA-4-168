import { useState } from 'react';
import type { InstructorAssignmentRole } from '../../services/api/courseService';
import { instructorAssignmentRoles } from './courseUtils';

interface AssignInstructorDialogProps {
  open: boolean;
  isSubmitting: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (instructorSsn: number, role: InstructorAssignmentRole | '') => Promise<void>;
}

export function AssignInstructorDialog({ open, isSubmitting, error, onCancel, onConfirm }: AssignInstructorDialogProps) {
  const [instructorSsn, setInstructorSsn] = useState('');
  const [role, setRole] = useState<InstructorAssignmentRole | ''>('');

  if (!open) {
    return null;
  }

  const handleConfirm = async () => {
    if (!instructorSsn.trim()) {
      return;
    }

    await onConfirm(Number(instructorSsn), role);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-modal">
        <h2 className="text-title-sm font-semibold text-on-surface">Assign Instructor</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          Enter the instructor SSN and choose their role on this course.
        </p>

        <label className="mt-5 block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Instructor SSN
          <input
            type="number"
            value={instructorSsn}
            onChange={(event) => setInstructorSsn(event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="mt-4 block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as InstructorAssignmentRole | '')}
            className="mt-2 w-full rounded-lg border border-input-border bg-surface-lowest px-3 py-2 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          >
            <option value="">Select role</option>
            {instructorAssignmentRoles.map((assignmentRole) => (
              <option key={assignmentRole} value={assignmentRole}>
                {assignmentRole}
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
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Assigning...' : 'Assign Instructor'}
          </button>
        </div>
      </div>
    </div>
  );
}
