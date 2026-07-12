import { useMemo } from 'react';
import { BookOpen, BusFront, Wallet, GraduationCap } from 'lucide-react';
import { useStudentSummary } from '../hooks/useStudentSummary'; // You'll need to create this hook
import { formatCurrency } from '../utils/formatters'; // Assuming you have formatters

export default function StudentDashboardPage() {
  const { data: summary, isLoading } = useStudentSummary();

  const statCards = useMemo(() => ([
    { label: 'Enrolled Courses', value: summary?.activeCourses ?? 0, icon: BookOpen },
    { label: 'Active Ride Bookings', value: summary?.activeRides ?? 0, icon: BusFront },
    { label: 'Pending Payments', value: summary ? formatCurrency(summary.pendingPayments) : '—', icon: Wallet },
    { label: 'Academic Status', value: summary?.status ?? '—', icon: GraduationCap },
  ]), [summary]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center">Loading...</div>;
  }

  return (
    <div className="p-6 md:p-10">
      <h1 className="mb-8 text-headline-md text-on-surface">My Dashboard</h1>

      {/* Stats Grid */}
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-body-sm text-outline">{card.label}</p>
                  <h3 className="mt-2 text-2xl font-bold text-on-surface">{card.value}</h3>
                </div>
                <div className="rounded-lg bg-secondary-fixed p-2 text-secondary">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Placeholder for Student-specific list (e.g., Courses or Rides) */}
      <section className="rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-sm">
        <h4 className="text-title-sm font-semibold text-on-surface mb-4">My Recent Activity</h4>
        <div className="text-body-sm text-on-surface-variant">
          Activity log will appear here...
        </div>
      </section>
    </div>
  );
}
