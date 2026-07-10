import { Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TripStatusBadge } from '../../features/trips/TripStatusBadge';
import { TripStudentsList } from '../../features/trips/TripStudentsList';
import { formatDateTime, tripStatuses } from '../../features/trips/tripUtils';
import { getApiErrorMessage, normalizeTripStatus, tripService } from '../../services/api/tripService';
import type { TripDto, TripStatus } from '../../services/api/tripService';
import { isAdmin } from '../../utils/auth';

export default function TripDetailPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManageTrips = isAdmin(user?.roles);

  const [trip, setTrip] = useState<TripDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TripStatus>('Pending');
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const loadTrip = async () => {
    if (!tripId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await tripService.getTrip(Number(tripId));
      setTrip(data);
      setSelectedStatus(normalizeTripStatus(data.status));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTrip();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  const handleSaveStatus = async () => {
    if (!trip || !tripId || selectedStatus === trip.status) return;
    setIsSavingStatus(true);
    setError(null);
    try {
      const nextStatus = normalizeTripStatus(selectedStatus);
      const updated = await tripService.updateTrip(Number(tripId), {
        driverSsn: trip.driverSsn,
        destination: trip.destination,
        pickupArea: trip.pickupArea,
        estimatedTimeOfArrival: trip.estimatedTimeOfArrival,
        price: trip.price,
        maxSeats: trip.maxSeats,
        status: nextStatus,
      });
      setTrip(updated);
      setSelectedStatus(normalizeTripStatus(updated.status));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleAddStudent = async (studentSsn: number) => {
    if (!tripId) return;
    setIsBusy(true);
    try {
      const updated = await tripService.addStudentToTrip(Number(tripId), { studentSsn });
      setTrip(updated);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsBusy(false);
    }
  };

  const handleRemoveStudent = async (studentSsn: number) => {
    if (!tripId) return;
    setIsBusy(true);
    try {
      await tripService.removeStudentFromTrip(Number(tripId), studentSsn);
      await loadTrip();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading) {
    return <p className="text-body-sm text-on-surface-variant">Loading trip...</p>;
  }

  if (error && !trip) {
    return <p className="text-body-sm text-error">{error}</p>;
  }

  if (!trip) {
    return <p className="text-body-sm text-on-surface-variant">Trip not found.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-display-lg font-bold text-on-background">Trip #{trip.tripId}</h1>
            <TripStatusBadge status={trip.status} />
          </div>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {trip.destination} · {trip.pickupArea}
          </p>
          {!canManageTrips ? (
            <p className="mt-3 rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-body-sm text-on-surface-variant">
              View-only access. You can inspect trip details, but updates are restricted to administrators.
            </p>
          ) : null}
        </div>
        {canManageTrips ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
              Status
              <div className="mt-2 flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(event) => setSelectedStatus(normalizeTripStatus(event.target.value))}
                  className="rounded-lg border border-input-border bg-white px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
                >
                  {tripStatuses.map((statusOption) => (
                    <option key={statusOption} value={statusOption}>
                      {statusOption}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  disabled={isSavingStatus || selectedStatus === trip.status}
                  className="rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingStatus ? 'Saving...' : 'Save'}
                </button>
              </div>
            </label>
            <button
              type="button"
              onClick={() => navigate(`/trips/${trip.tripId}/edit`)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-card-border px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
            >
              <Pencil className="h-4 w-4" />
              Edit Trip
            </button>
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-card-border bg-white p-6 shadow-card">
          <h2 className="text-title-sm text-on-background">Trip Details</h2>
          <dl className="mt-4 space-y-3">
            <div className="flex justify-between text-body-sm">
              <dt className="text-on-surface-variant">Driver</dt>
              <dd className="font-semibold text-on-surface">{trip.driverName}</dd>
            </div>
            <div className="flex justify-between text-body-sm">
              <dt className="text-on-surface-variant">Estimated Arrival</dt>
              <dd className="font-semibold text-on-surface">{formatDateTime(trip.estimatedTimeOfArrival)}</dd>
            </div>
            <div className="flex justify-between text-body-sm">
              <dt className="text-on-surface-variant">Price</dt>
              <dd className="font-semibold text-on-surface">{trip.price.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between text-body-sm">
              <dt className="text-on-surface-variant">Seats</dt>
              <dd className="font-semibold text-on-surface">
                {trip.seatsTaken} / {trip.maxSeats}
              </dd>
            </div>
          </dl>
        </div>

        <TripStudentsList
          students={trip.students}
          maxSeats={trip.maxSeats}
          isBusy={isBusy}
          canManageStudents={canManageTrips}
          onAddStudent={handleAddStudent}
          onRemoveStudent={handleRemoveStudent}
        />
      </section>

      {error ? <p className="text-body-sm text-error">{error}</p> : null}

      <Link to="/trips" className="inline-block text-body-sm font-semibold text-secondary hover:underline">
        ← Back to all trips
      </Link>
    </div>
  );
}
