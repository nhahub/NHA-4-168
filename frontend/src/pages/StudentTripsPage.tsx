import { useEffect, useState } from 'react';
import { BusFront } from 'lucide-react';
import { BookTripDialog } from '../features/trips/BookTripDialog';
import { TripStatusBadge } from '../features/trips/TripStatusBadge';
import { sortTripsByTime, formatDateTime } from '../features/trips/tripUtils';
import { getApiErrorMessage, tripService } from '../services/api/tripService';
import type { TripDto } from '../services/api/tripService';
import { studentService } from '../services/api/studentService';
import { formatCurrency } from '../utils/formatters';

export default function StudentTripsPage() {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [studentSsn, setStudentSsn] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedTrip, setSelectedTrip] = useState<TripDto | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [justBookedTripId, setJustBookedTripId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const [tripsData, currentStudent] = await Promise.all([
          tripService.getTrips(),
          studentService.getCurrentStudent(),
        ]);

        if (!active) return;
        setTrips(tripsData);
        setStudentSsn(currentStudent.studentSsn);
      } catch (requestError) {
        if (active) {
          setLoadError(getApiErrorMessage(requestError));
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

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
      setJustBookedTripId(updatedTrip.tripId);
      setSelectedTrip(null);
    } catch (requestError) {
      setBookError(getApiErrorMessage(requestError));
    } finally {
      setIsBooking(false);
    }
  };

  const upcomingTrips = sortTripsByTime(trips).filter((trip) => trip.status !== 'Cancelled' && trip.status !== 'Completed');

  if (isLoading) {
    return <div className="rounded-xl border border-card-border bg-white p-6 text-body-sm text-on-surface-variant shadow-card">Loading trips...</div>;
  }

  if (loadError) {
    return <div className="rounded-xl border border-card-border bg-white p-6 text-body-sm text-error shadow-card">{loadError}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-lg font-bold text-on-background">My Trips</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Browse available trips and book your seat.</p>
      </div>

      {upcomingTrips.length === 0 ? (
        <div className="rounded-xl border border-card-border bg-white p-6 text-body-sm text-on-surface-variant shadow-card">
          No trips available right now.
        </div>
      ) : (
        <ul className="space-y-3">
          {upcomingTrips.map((trip) => {
            const isFull = trip.seatsTaken >= trip.maxSeats;
            const alreadyBooked = studentSsn != null && trip.students.some((student) => student.studentSsn === studentSsn);
            const showJustBooked = trip.tripId === justBookedTripId;

            return (
              <li
                key={trip.tripId}
                className="flex flex-col gap-3 rounded-xl border border-card-border bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-lg bg-secondary-fixed p-2 text-secondary">
                    <BusFront className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-body-md font-semibold text-on-surface">
                      {trip.destination} · {trip.pickupArea}
                    </p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {formatDateTime(trip.estimatedTimeOfArrival)} · Driver: {trip.driverName}
                    </p>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {trip.seatsTaken}/{trip.maxSeats} seats · {formatCurrency(trip.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  <TripStatusBadge status={trip.status} />
                  {alreadyBooked || showJustBooked ? (
                    <span className="rounded-lg border border-outline-variant px-4 py-2 text-body-sm font-semibold text-on-surface-variant">
                      Booked
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={isFull}
                      onClick={() => openBookingDialog(trip)}
                      className="rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isFull ? 'Full' : 'Book'}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

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
