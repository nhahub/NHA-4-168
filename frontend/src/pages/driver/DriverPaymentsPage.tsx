import { useEffect, useMemo, useState } from 'react';
import { tripService } from '../../services/api/tripService';
import type { TripDto } from '../../services/api/tripService';
import { driverService } from '../../services/api/driverService';
import { getApiErrorMessage } from '../../utils/errorMessage';

// Share of each trip booking that the driver keeps as earnings.
// The remaining (1 - DRIVER_EARNINGS_RATE) is the admin's revenue.
const DRIVER_EARNINGS_RATE = 0.9;

export default function DriverPaymentsPage() {
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

  const totalEarnings = useMemo(
    () => trips.reduce((sum, trip) => sum + trip.seatsTaken * trip.price * DRIVER_EARNINGS_RATE, 0),
    [trips],
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-display-lg font-bold text-on-background">Payment</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Earnings from your trips</p>
      </section>

      <section className="rounded-xl border border-card-border bg-surface-lowest p-6 shadow-card">
        <p className="text-body-sm text-on-surface-variant">Total earnings</p>
        <p className="mt-1 text-3xl font-bold text-on-background">${totalEarnings.toFixed(2)}</p>
      </section>

      <section className="rounded-xl border border-card-border bg-surface-lowest shadow-card">
        {error ? (
          <div className="p-6 text-body-sm text-error">{error}</div>
        ) : isLoading ? (
          <div className="p-6 text-body-sm text-on-surface-variant">Loading...</div>
        ) : trips.length === 0 ? (
          <div className="p-6 text-body-sm text-on-surface-variant">No trips yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Trip</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Destination</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Students</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Price / seat</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {trips.map((trip) => (
                  <tr key={trip.tripId} className="hover:bg-table-row-hover">
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">#{trip.tripId}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{trip.destination}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{trip.seatsTaken}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">${trip.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">
                      ${(trip.seatsTaken * trip.price * DRIVER_EARNINGS_RATE).toFixed(2)}
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
