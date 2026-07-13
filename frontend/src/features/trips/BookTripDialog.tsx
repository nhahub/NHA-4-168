import type { TripDto } from '../../services/api/tripService';
import { formatDateTime } from './tripUtils';
import { formatCurrency } from '../../utils/formatters';

interface BookTripDialogProps {
  open: boolean;
  trip: TripDto | null;
  isSubmitting: boolean;
  error?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BookTripDialog({ open, trip, isSubmitting, error, onConfirm, onCancel }: BookTripDialogProps) {
  if (!open || !trip) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 px-4">
      <div className="w-full max-w-md rounded-xl border border-outline-variant bg-white p-6 shadow-modal">
        <h2 className="text-title-sm font-semibold text-on-surface">Confirm Booking</h2>
        <p className="mt-2 text-body-sm text-on-surface-variant">
          {trip.destination} · {trip.pickupArea}
        </p>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          {formatDateTime(trip.estimatedTimeOfArrival)} · Driver: {trip.driverName}
        </p>

        <div className="mt-5 rounded-lg border border-outline-variant bg-surface-container-low p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
            Amount to be charged
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-black">{formatCurrency(trip.price)}</p>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            This will be deducted from your card on file.
          </p>
        </div>

        {error ? <p className="mt-4 text-body-sm text-error">{error}</p> : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-card-border px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Booking...' : `Pay ${formatCurrency(trip.price)} & Book`}
          </button>
        </div>
      </div>
    </div>
  );
}
