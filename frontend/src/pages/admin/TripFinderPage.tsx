import { ListChecks, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TripStatusBadge } from '../../features/trips/TripStatusBadge';
import { TRIP_DESTINATIONS, TRIP_PICKUP_AREAS, formatDateTime, isSameDay } from '../../features/trips/tripUtils';
import { getApiErrorMessage, tripService } from '../../services/api/tripService';
import type { TripDto } from '../../services/api/tripService';
import { isAdmin } from '../../utils/auth';

export default function TripFinderPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canCreateTrips = isAdmin(user?.roles);

  const [allTrips, setAllTrips] = useState<TripDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [destination, setDestination] = useState('');
  const [pickupArea, setPickupArea] = useState('');
  const [date, setDate] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let active = true;

    tripService
      .getTrips()
      .then((data) => {
        if (active) setAllTrips(data);
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const matches = useMemo(() => {
    if (!hasSearched) return [];
    return allTrips.filter((trip) => {
      const matchesDestination = destination === '' || trip.destination === destination;
      const matchesPickup = pickupArea === '' || trip.pickupArea === pickupArea;
      const matchesDate = date === '' || isSameDay(trip.estimatedTimeOfArrival, new Date(date).toISOString());
      return matchesDestination && matchesPickup && matchesDate;
    });
  }, [allTrips, destination, pickupArea, date, hasSearched]);

  const handleSearch = () => {
    setHasSearched(true);
  };

  const handleCreate = () => {
    navigate('/trips/new', {
      state: {
        destination: destination || undefined,
        pickupArea: pickupArea || undefined,
        estimatedTimeOfArrival: date ? new Date(date).toISOString() : undefined,
      },
    });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-on-background mb-8">Find a Trip</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            Search for an existing trip, or create a new one if nothing matches.
          </p>
        </div>
        <Link
          to="/trips/all"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-card-border px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
        >
          <ListChecks className="h-4 w-4" />
          View All Trips
        </Link>
      </section>

      <section className="rounded-xl border border-card-border bg-surface-lowest p-6 shadow-card">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
            Destination
            <select
              value={destination}
              onChange={(event) => setDestination(event.target.value)}
              className="mt-2 w-full rounded-lg border border-input-border bg-surface-lowest px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
            >
              <option value="">Any destination</option>
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
              value={pickupArea}
              onChange={(event) => setPickupArea(event.target.value)}
              className="mt-2 w-full rounded-lg border border-input-border bg-surface-lowest px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
            >
              <option value="">Any pickup area</option>
              {TRIP_PICKUP_AREAS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-card-border px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
          >
            <Plus className="h-4 w-4" />
            {canCreateTrips ? 'Create Trip' : 'Suggest a Trip'}
          </button>
          <button
            type="button"
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </section>

      {hasSearched ? (
        <section className="rounded-xl border border-card-border bg-surface-lowest shadow-card">
          <div className="border-b border-outline-variant p-4">
            <h2 className="text-title-sm text-on-background">
              {isLoading ? 'Searching...' : `${matches.length} matching trip${matches.length === 1 ? '' : 's'}`}
            </h2>
          </div>

          {error ? (
            <div className="p-6 text-body-sm text-error">{error}</div>
          ) : matches.length === 0 ? (
            <div className="p-6">
              <p className="text-body-sm text-on-surface-variant">
                No trips match these details yet. You can create one with the same criteria.
              </p>
              <button
                type="button"
                onClick={handleCreate}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                {canCreateTrips ? 'Create This Trip' : 'Suggest This Trip'}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-outline-variant/60">
              {matches.map((trip) => (
                <li key={trip.tripId} className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-body-sm font-semibold text-on-surface">
                      {trip.destination} · {trip.pickupArea}
                    </p>
                    <p className="text-body-sm text-on-surface-variant">
                      {formatDateTime(trip.estimatedTimeOfArrival)} · Driver: {trip.driverName} · {trip.seatsTaken}/{trip.maxSeats} seats
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <TripStatusBadge status={trip.status} />
                    <Link
                      to={`/trips/${trip.tripId}`}
                      className="rounded-lg border border-card-border px-3 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
