import { useEffect, useMemo, useState } from 'react';
import { DollarSign, CheckCircle2, TrendingUp, LoaderCircle } from 'lucide-react';
import { tripService } from '../../services/api/tripService';
import type { TripDto } from '../../services/api/tripService';
import { driverService } from '../../services/api/driverService';
import { getApiErrorMessage } from '../../utils/errorMessage';

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

  const completedTrips = useMemo(
    () => trips.filter((trip) => trip.status?.toLowerCase() === 'completed').length,
    [trips],
  );

  const avgEarnings = useMemo(
    () => trips.length > 0 ? totalEarnings / trips.length : 0,
    [trips, totalEarnings],
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-on-surface-variant">
        <LoaderCircle className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Earnings',
      value: `$${totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-white',
      bg: 'bg-green-500',
      cardBg: 'bg-green-600',
      titleColor: 'text-green-100',
    },
    {
      title: 'Completed Trips',
      value: completedTrips.toString(),
      icon: CheckCircle2,
      color: 'text-white',
      bg: 'bg-teal-500',
      cardBg: 'bg-teal-700',
      titleColor: 'text-teal-100',
    },
    {
      title: 'Avg. Earnings per Trip',
      value: `$${avgEarnings.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-white',
      bg: 'bg-yellow-600',
      cardBg: 'bg-yellow-500',
      titleColor: 'text-yellow-100',
    },
  ];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-on-background">My Payments</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Your earnings from trips you've completed, paid at a flat rate per booking.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((item) => (
          <div key={item.title} className={`rounded-2xl border border-card-border ${item.cardBg} p-6 shadow-sm`}>
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-[12px] font-semibold uppercase tracking-[0.08em] ${item.titleColor}`}>
                  {item.title}
                </p>
                <h2 className={`mt-3 text-[28px] font-bold ${item.color}`}>{item.value}</h2>
              </div>
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                <item.icon className={item.color} size={22} />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-card-border bg-surface-lowest shadow-card">
        <div className="border-b border-outline-variant p-6">
          <h4 className="text-title-sm font-semibold text-on-surface">Trip Breakdown</h4>
          <p className="text-body-sm text-on-surface-variant">Earnings per trip you've been assigned to</p>
        </div>

        {error ? (
          <div className="p-6 text-body-sm text-error">{error}</div>
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
