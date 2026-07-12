import { formatFee } from './courseUtils';

interface EnrollCourseDialogProps {
  open: boolean;
  courseName: string;
  fee?: number | null;
  isPaid: boolean;
  courseRating: number | null;
  instructorName: string | null;
  instructorRating: number | null;
  isLoadingDetails: boolean;
  isSubmitting: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export function EnrollCourseDialog({
  open,
  courseName,
  fee,
  isPaid,
  courseRating,
  instructorName,
  instructorRating,
  isLoadingDetails,
  isSubmitting,
  error,
  onCancel,
  onConfirm,
}: EnrollCourseDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-modal">
        <h2 className="text-title-sm font-semibold text-on-surface">Confirm Enrollment</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          You're about to enroll in <span className="font-semibold">{courseName}</span>.
        </p>

        {isLoadingDetails ? (
          <p className="mt-5 text-body-sm text-on-surface-variant">Loading course details...</p>
        ) : (
          <div className="mt-5 space-y-3 rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-on-surface-variant">Course rating</span>
              <span className="text-body-sm font-semibold text-on-surface">
                {courseRating !== null ? `${courseRating.toFixed(1)} / 5` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-on-surface-variant">Instructor</span>
              <span className="text-body-sm font-semibold text-on-surface">{instructorName ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-body-sm text-on-surface-variant">Instructor rating</span>
              <span className="text-body-sm font-semibold text-on-surface">
                {instructorRating !== null ? `${instructorRating.toFixed(1)} / 5` : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-outline-variant pt-3">
              <span className="text-body-sm text-on-surface-variant">Price</span>
              <span className="text-body-sm font-semibold text-on-surface">{formatFee(fee, isPaid)}</span>
            </div>
          </div>
        )}

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
            disabled={isSubmitting || isLoadingDetails}
            className="rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Enrolling...' : 'Confirm Enroll'}
          </button>
        </div>
      </div>
    </div>
  );
}
