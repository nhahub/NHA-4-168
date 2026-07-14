import { useMemo } from 'react';
import { BookOpen, BusFront, Wallet, GraduationCap } from 'lucide-react';
import { useStudentSummary } from '../hooks/useStudentSummary'; // You'll need to create this hook
import { formatCurrency } from '../utils/formatters'; // Assuming you have formatters
import { useStudentActivities } from '../hooks/useStudentActivities';

export default function StudentDashboardPage() {
  const { data: summary, isLoading } = useStudentSummary();

  const { data: activities = [] } = useStudentActivities();

  const statCards = useMemo(() => ([
    { label: 'Enrolled Courses', value: summary?.activeCourses ?? 0, icon: BookOpen, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    { label: 'Active Ride Bookings', value: summary?.activeRides ?? 0, icon: BusFront, iconColor: 'text-sky-600', iconBg: 'bg-sky-100' },
    { label: 'My Payments', value: summary ? formatCurrency(summary.paidPayments) : '—', icon: Wallet, iconColor: 'text-green-600', iconBg: 'bg-green-100' },
    { label: 'Academic Status', value: summary?.status ?? '—', icon: GraduationCap, iconColor: 'text-yellow-600', iconBg: 'bg-yellow-100' },
  ]), [summary]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>;
  }

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-display-lg font-bold text-on-background">My Dashboard</h1>
        <p className="mt-1 text-[16px] leading-6 text-on-surface-variant">Overview of your enrolled courses, ride bookings, payments, and academic status.</p>
      </section>

      {/* Stats Grid */}
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-lowest p-5 shadow-sm">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.iconBg}`}>
                <Icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-on-surface-variant truncate">{card.label}</p>
                <h3 className="text-[24px] font-bold leading-8 text-on-surface truncate">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </section>

      {/* Placeholder for Student-specific list (e.g., Courses or Rides) */}
      <section className="rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-sm">
        <h4 className="text-title-sm font-semibold text-on-surface mb-4">My Recent Activity</h4>
        {activities.length === 0 ? (
          <div className="text-body-sm text-on-surface-variant">
            No recent activity.
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b border-outline-variant pb-3 last:border-0"
              >
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-on-surface-variant">
                    {new Date(activity.occurredAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
