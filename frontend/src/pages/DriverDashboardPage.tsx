import { useMemo } from 'react';
import { BusFront, CheckCircle2, Route, LoaderCircle } from 'lucide-react';
import { useDriverSummary } from '../hooks/useDriverSummary';
import { useDriverTrips } from '../hooks/useDriverTrips';
import { useDriverActivities } from '../hooks/useDriverActivities';
import type { TripDto } from '../services/api/tripService';
import { normalizeTripStatus } from '../services/api/tripService';

const activityIconMap = {
  BusFront,
};

const toneClasses = {
  info: 'bg-secondary-fixed text-secondary',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-rose-100 text-rose-700',
  neutral: 'bg-slate-100 text-slate-700',
};

const statusTone: Record<string, keyof typeof toneClasses> = {
  Pending: 'neutral',
  Available: 'info',
  Full: 'info',
  InProgress: 'info',
  Completed: 'success',
  Cancelled: 'danger',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatEta(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatRelativeTime(value: string | null) {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

export default function DriverDashboardPage() {
  const summaryQuery = useDriverSummary();
  const tripsQuery = useDriverTrips();
  const activitiesQuery = useDriverActivities(5);

  const summary = summaryQuery.data;
  const trips = (tripsQuery.data ?? []) as unknown as TripDto[];
  const activities = activitiesQuery.data ?? [];

  const statCards = useMemo(() => ([
    { label: 'Total Trips', value: summary?.totalTrips ?? 0, icon: BusFront },
    { label: 'Completed Trips', value: summary?.completedTrips ?? 0, icon: CheckCircle2 },
    { label: 'Active Trips', value: summary?.activeTrips ?? 0, icon: Route },
  ]), [summary]);

  const isLoading = summaryQuery.isLoading || tripsQuery.isLoading || activitiesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-on-surface-variant">
        <LoaderCircle className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      {/* Header */}
      <section className="mb-8">
        <h2 className="text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-on-background">Driver Dashboard</h2>
        <p className="mt-1 text-[16px] leading-6 text-on-surface-variant">Overview of your assigned trips, completion stats, and passenger activity.</p>
      </section>

      {/* Stats Cards */}
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-secondary-fixed p-2">
                  <Icon className="h-6 w-6 text-secondary" />
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-secondary">Live data</span>
              </div>
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">{card.label}</p>
              <h3 className="text-[24px] font-bold leading-8 text-on-surface">{card.value}</h3>
            </div>
          );
        })}
      </section>

      {/* Split layout: Left: Trips, Right: Recent Activity */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Trips Table */}
        <div className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-lowest shadow-sm">
          <div className="border-b border-outline-variant p-6">
            <h4 className="text-title-sm font-semibold text-on-surface">My Assigned Trips</h4>
            <p className="text-body-sm text-on-surface-variant">All trips assigned to you</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">TRIP ID</th>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">DESTINATION</th>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">PICKUP AREA</th>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">ETA</th>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">SEATS</th>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">PRICE</th>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {trips.length > 0 ? (
                  trips.map((trip) => {
                    const status = normalizeTripStatus(trip.status);
                    const tone = statusTone[status] ?? 'info';
                    return (
                      <tr key={trip.tripId} className="transition-colors hover:bg-surface-container-low">
                        <td className="px-6 py-4 font-body-sm text-body-sm font-semibold text-on-surface">{trip.tripId}</td>
                        <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{trip.destination}</td>
                        <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{trip.pickupArea}</td>
                        <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{formatEta(trip.estimatedTimeOfArrival)}</td>
                        <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{trip.seatsTaken} / {trip.maxSeats}</td>
                        <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{formatCurrency(trip.price)}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${toneClasses[tone]}`}>{status}</span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="px-6 py-8 text-center text-body-sm text-on-surface-variant" colSpan={7}>
                      No trips assigned.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="flex h-full flex-col rounded-xl border border-outline-variant bg-surface-lowest shadow-sm">
          <div className="border-b border-outline-variant p-6">
            <h4 className="text-title-sm font-semibold text-on-surface">Recent Passenger Activity</h4>
            <p className="text-body-sm text-on-surface-variant">Latest booking updates on your trips</p>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {activities.length > 0 ? (
              activities.map((activity, index) => {
                const Icon = activityIconMap[activity.icon as keyof typeof activityIconMap] ?? BusFront;
                const tone = (activity.tone as keyof typeof toneClasses) || 'info';
                return (
                  <div key={`${activity.title}-${index}`} className="flex gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneClasses[tone] || toneClasses.info}`}>
                      <Icon className="scale-75 h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-body-sm text-on-surface">{activity.title}</p>
                      <span className="text-[12px] text-outline">{formatRelativeTime(activity.occurredAt)}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-8 text-body-sm text-on-surface-variant">No recent activity.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
