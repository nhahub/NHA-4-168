import { Eye, Pencil, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BookTripDialog } from '../../features/trips/BookTripDialog';
import { TripStatusBadge } from '../../features/trips/TripStatusBadge';
import { formatDateTime, sortTripsByTime, tripStatuses } from '../../features/trips/tripUtils';
import { getApiErrorMessage, tripService } from '../../services/api/tripService';
import type { TripDto, TripStatus } from '../../services/api/tripService';
import { studentService } from '../../services/api/studentService';
import { isAdmin } from '../../utils/auth';
import { loadTripSuggestions } from '../../utils/tripSuggestions';

export default function TripsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManageTrips = isAdmin(user?.roles);
  const [searchParams] = useSearchParams();
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [suggestions, setSuggestions] = useState<ReturnType<typeof loadTripSuggestions>>([]);
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [status, setStatus] = useState<TripStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [studentSsn, setStudentSsn] = useState<number | null>(null);

  const [selectedTrip, setSelectedTrip] = useState<TripDto | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);

  useEffect(() => {
    setSuggestions(loadTripSuggestions());
  }, []);

  useEffect(() => {
    let active = true;

    const loadTrips = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await tripService.getTrips();
        if (active) setTrips(data);
      } catch (requestError) {
        if (active) setError(getApiErrorMessage(requestError));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadTrips();

    return () => {
      active = false;
    };
  }, []);

  // Students need their own SSN to book a seat and to know which trips they've already joined.
  useEffect(() => {
    if (canManageTrips) return;
    let active = true;

    studentService
      .getCurrentStudent()
      .then((student) => {
        if (active) setStudentSsn(student.studentSsn);
      })
      .catch(() => {
        // Silently ignore — booking simply won't be available if this fails.
      });

    return () => {
      active = false;
    };
  }, [canManageTrips]);

  useEffect(() => {
    const handleSuggestionsChange = () => {
      setSuggestions(loadTripSuggestions());
    };

    window.addEventListener('trip-suggestions-changed', handleSuggestionsChange);
    window.addEventListener('storage', handleSuggestionsChange);
    return () => {
      window.removeEventListener('trip-suggestions-changed', handleSuggestionsChange);
      window.removeEventListener('storage', handleSuggestionsChange);
    };
  }, []);

  const visibleTrips = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = trips.filter((trip) => {
      const matchesSearch =
        term === '' ||
        trip.destination.toLowerCase().includes(term) ||
        trip.pickupArea.toLowerCase().includes(term) ||
        (trip.driverName?.toLowerCase().includes(term) ?? false);
      const matchesStatus = status === '' || trip.status === status;
      return matchesSearch && matchesStatus;
    });
    return sortTripsByTime(filtered);
  }, [trips, search, status]);

  const openBookingDialog = (trip: TripDto) => {
    setBookError(null);
    setSelectedTrip(trip);
  };

  const closeBookingDialog = () => {
    if (isBooking) return;
    setSelectedTrip(null);
    setBookError(null);
  };

  const handleConfirmBooking = async () => {
    if (!selectedTrip || studentSsn == null) return;

    setIsBooking(true);
    setBookError(null);

    try {
      const updatedTrip = await tripService.addStudentToTrip(selectedTrip.tripId, { studentSsn });
      setTrips((current) => current.map((trip) => (trip.tripId === updatedTrip.tripId ? updatedTrip : trip)));
      setSelectedTrip(null);
      // A Pending payment for this booking was created by the backend; send the
      // student straight to it, same as the course enrollment flow.
      navigate(`/student/payments/trip/${updatedTrip.tripId}/complete`);
    } catch (requestError) {
      setBookError(getApiErrorMessage(requestError));
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-display-lg font-bold text-on-background">Trips</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">{visibleTrips.length} records</p>
        </div>
        {canManageTrips ? (
          <Link
            to="/trips/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {canManageTrips ? 'Add Trip' : 'Suggest a Trip'}
          </Link>
        ) : null}
      </section>

      {canManageTrips ? (
        <section className="rounded-xl border border-card-border bg-surface-lowest p-6 shadow-card">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-title-sm font-semibold text-on-background">Suggested Trips</h2>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                These are student-submitted trip requests waiting for admin approval. You can add the driver, price, and seats before creating the real trip.
              </p>
            </div>
          </div>
          {suggestions.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-outline-variant p-4 text-body-sm text-on-surface-variant">
              No suggested trips yet.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface">
                        {suggestion.destination} · {suggestion.pickupArea}
                      </p>
                      <p className="text-body-sm text-on-surface-variant">
                        {formatDateTime(suggestion.estimatedTimeOfArrival)} · Suggested by {suggestion.submittedByName}
                      </p>
                    </div>
                    <Link
                      to="/trips/new"
                      state={{ reviewSuggestion: suggestion }}
                      className="inline-flex items-center justify-center rounded-lg border border-card-border px-3 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
                    >
                      Review suggestion
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : null}


      <section className="rounded-xl border border-card-border bg-surface-lowest shadow-card">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search destination, pickup area, or driver"
              className="w-full rounded-lg border border-input-border py-2 pl-10 pr-3 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
              type="search"
            />
          </div>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as TripStatus | '')}
            className="rounded-lg border border-input-border bg-surface-lowest px-3 py-2 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          >
            <option value="">All statuses</option>
            {tripStatuses.map((tripStatus) => (
              <option key={tripStatus} value={tripStatus}>
                {tripStatus}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="p-6 text-body-sm text-error">{error}</div>
        ) : isLoading ? (
          <div className="p-6 text-body-sm text-on-surface-variant">Loading trips...</div>
        ) : visibleTrips.length === 0 ? (
          <div className="p-6 text-body-sm text-on-surface-variant">No trips found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Trip</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Driver</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Destination</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Pickup Area</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">ETA</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Seats</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Price</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Status</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {visibleTrips.map((trip) => {
                  const isFull = trip.seatsTaken >= trip.maxSeats;
                  const alreadyBooked = studentSsn != null && trip.students.some((student) => student.studentSsn === studentSsn);
                  const canBook = !canManageTrips && studentSsn != null && !isFull && !alreadyBooked;

                  return (
                    <tr key={trip.tripId} className="hover:bg-table-row-hover">
                      <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">#{trip.tripId}</td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">{trip.driverName}</td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">{trip.destination}</td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">{trip.pickupArea}</td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatDateTime(trip.estimatedTimeOfArrival)}</td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                        {trip.seatsTaken} / {trip.maxSeats}
                      </td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">{trip.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <TripStatusBadge status={trip.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/trips/${trip.tripId}`}
                            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                            aria-label={`View trip ${trip.tripId}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {canManageTrips ? (
                            <Link
                              to={`/trips/${trip.tripId}/edit`}
                              className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                              aria-label={`Edit trip ${trip.tripId}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                          ) : null}
                          {!canManageTrips ? (
                            alreadyBooked ? (
                              <span className="rounded-lg border border-outline-variant px-3 py-1.5 text-body-sm font-semibold text-on-surface-variant">
                                Booked
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={!canBook}
                                onClick={() => openBookingDialog(trip)}
                                className="rounded-lg bg-secondary px-3 py-1.5 text-body-sm font-semibold text-on-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isFull ? 'Full' : 'Book'}
                              </button>
                            )
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <BookTripDialog
        open={Boolean(selectedTrip)}
        trip={selectedTrip}
        isSubmitting={isBooking}
        error={bookError}
        onConfirm={handleConfirmBooking}
        onCancel={closeBookingDialog}
      />
    </div>
  );
}
