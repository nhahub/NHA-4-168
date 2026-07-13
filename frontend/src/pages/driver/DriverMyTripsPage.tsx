import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tripService } from '../../services/api/tripService';
import type { TripDto } from '../../services/api/tripService';
import { driverService } from '../../services/api/driverService';
import { getApiErrorMessage } from '../../utils/errorMessage';

export default function DriverMyTripsPage() {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const driver = await driverService.getCurrentDriver();
        const data = await tripService.getTripsByDriver(driver.driverSsn);
        if (active) setTrips(data);
      } catch (requestError) {
        if (active) setError(getApiErrorMessage(requestError));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-display-lg font-bold text-on-background">My Trips</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">{trips.length} records</p>
      </section>

      <section className="rounded-xl border border-card-border bg-surface-lowest shadow-card">
        {error ? (
          <div className="p-6 text-body-sm text-error">{error}</div>
        ) : isLoading ? (
          <div className="p-6 text-body-sm text-on-surface-variant">Loading trips...</div>
        ) : trips.length === 0 ? (
          <div className="p-6 text-body-sm text-on-surface-variant">You haven't taken any trips yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Trip</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Destination</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Pickup Area</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Seats</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Price</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Status</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {trips.map((trip) => (
                  <tr key={trip.tripId} className="hover:bg-table-row-hover">
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">#{trip.tripId}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{trip.destination}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{trip.pickupArea}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                      {trip.seatsTaken} / {trip.maxSeats}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{trip.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{trip.status}</td>
                    <td className="px-6 py-4">
                      <Link
                        to={`/trips/${trip.tripId}`}
                        className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                        aria-label={`View trip ${trip.tripId}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
