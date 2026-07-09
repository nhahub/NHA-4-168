import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { driverService } from '../../services/api/driverService';
import type { DriverListItemDto } from '../../services/api/driverService';
import { MAX_TRIP_SEATS } from '../../services/api/tripService';
import type { TripDto, TripFormPayload } from '../../services/api/tripService';
import { TRIP_DESTINATIONS, TRIP_PICKUP_AREAS, toDateTimeInputValue, fromDateTimeInputValue } from './tripUtils';

interface TripFormProps {
  mode: 'create' | 'edit';
  initialTrip?: TripDto;
  initialValues?: Partial<{ destination: string; pickupArea: string; estimatedTimeOfArrival: string }>;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (payload: TripFormPayload) => Promise<void>;
  onCancel: () => void;
}

export function TripForm({ mode, initialTrip, initialValues, isSubmitting, error, onSubmit, onCancel }: TripFormProps) {
  const defaults = useMemo(
    () => ({
      driverSsn: initialTrip?.driverSsn ? String(initialTrip.driverSsn) : '',
      destination: initialTrip?.destination ?? initialValues?.destination ?? '',
      pickupArea: initialTrip?.pickupArea ?? initialValues?.pickupArea ?? '',
      estimatedTimeOfArrival: toDateTimeInputValue(
        initialTrip?.estimatedTimeOfArrival ?? initialValues?.estimatedTimeOfArrival,
      ),
      price: initialTrip?.price != null ? String(initialTrip.price) : '',
      maxSeats: initialTrip?.maxSeats != null ? String(initialTrip.maxSeats) : String(MAX_TRIP_SEATS),
    }),
    [initialTrip, initialValues],
  );

  const [values, setValues] = useState(defaults);
  const [drivers, setDrivers] = useState<DriverListItemDto[]>([]);
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true);

  useEffect(() => {
    let active = true;
    // NOTE: adjust getDrivers()/response shape here if driverService.ts
    // exposes a different method name or a non-paginated array.
    driverService
      .getDrivers({ page: 1, pageSize: 100 })
      .then((response) => {
        if (active) setDrivers(response.data);
      })
      .finally(() => {
        if (active) setIsLoadingDrivers(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateField = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      driverSsn: Number(values.driverSsn),
      destination: values.destination.trim(),
      pickupArea: values.pickupArea.trim(),
      estimatedTimeOfArrival: fromDateTimeInputValue(values.estimatedTimeOfArrival),
      price: Number(values.price),
      maxSeats: Number(values.maxSeats),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-card-border bg-white p-6 shadow-card">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Driver
          <select
            required
            value={values.driverSsn}
            onChange={(event) => updateField('driverSsn', event.target.value)}
            disabled={isLoadingDrivers}
            className="mt-2 w-full rounded-lg border border-input-border bg-white px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus disabled:opacity-60"
          >
            <option value="">{isLoadingDrivers ? 'Loading drivers...' : 'Select a driver'}</option>
            {drivers.map((driver) => (
              <option key={driver.driverSsn} value={driver.driverSsn}>
                {driver.firstName} {driver.lastName} — {driver.carModel}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Max Seats
          <input
            required
            type="number"
            min={1}
            max={MAX_TRIP_SEATS}
            value={values.maxSeats}
            onChange={(event) => updateField('maxSeats', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Destination
          <select
            required
            value={values.destination}
            onChange={(event) => updateField('destination', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border bg-white px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          >
            <option value="">Select a destination</option>
            {TRIP_DESTINATIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Pickup Area
          <select
            required
            value={values.pickupArea}
            onChange={(event) => updateField('pickupArea', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border bg-white px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          >
            <option value="">Select a pickup area</option>
            {TRIP_PICKUP_AREAS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Estimated Time of Arrival
          <input
            required
            type="datetime-local"
            value={values.estimatedTimeOfArrival}
            onChange={(event) => updateField('estimatedTimeOfArrival', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Price
          <input
            required
            type="number"
            min={0}
            step="0.01"
            value={values.price}
            onChange={(event) => updateField('price', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>
      </div>

      {error ? <p className="mt-5 text-body-sm text-error">{error}</p> : null}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-card-border px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Trip' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
