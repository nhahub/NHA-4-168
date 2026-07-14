import { useMemo, useState } from 'react';
import { BadgeDollarSign, BookOpenCheck, ChevronRight, CircleAlert, ClipboardList, Download, EllipsisVertical, GraduationCap, Layers3, LoaderCircle, Users, BusFront, X } from 'lucide-react';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { useEnrollmentTrends } from '../hooks/useEnrollmentTrends';
import { useRecentApplications } from '../hooks/useRecentApplications';
import { useRecentActivities } from '../hooks/useRecentActivities';
import type { ActivityLogDto, EnrollmentTrendDto, StudentApplicationDto } from '../types/dashboard';

const activityIconMap = {
  BookOpenCheck,
  BadgeDollarSign,
  CircleAlert,
  ClipboardList,
  GraduationCap,
  Layers3,
  BusFront,
};

const toneClasses = {
  info: 'bg-secondary-fixed text-secondary',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-rose-100 text-rose-700',
  neutral: 'bg-slate-100 text-slate-700',
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function formatRelativeTime(value: string | null) {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Recently';
  }

  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

function formatApplicationDate(value: string | null) {
  if (!value) {
    return '—';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes('approved') || normalized.includes('active') || normalized.includes('paid') || normalized.includes('completed')) {
    return 'success';
  }

  if (normalized.includes('reject') || normalized.includes('failed') || normalized.includes('cancel')) {
    return 'danger';
  }

  return 'info';
}

function AdminDashboardPage() {
  const [days, setDays] = useState(30);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);

  const summaryQuery = useDashboardSummary();
  const trendsQuery = useEnrollmentTrends(days);
  const applicationsQuery = useRecentApplications(5);
  const activitiesQuery = useRecentActivities(5);

  // Full-list queries — only fire when the modal is opened
  const allActivitiesQuery = useRecentActivities(9999);
  const allApplicationsQuery = useRecentApplications(9999);

  const summary = summaryQuery.data;
  const trendData = trendsQuery.data ?? [];
  const applications = applicationsQuery.data ?? [];
  const activities = activitiesQuery.data ?? [];

  // ── Export Report ─────────────────────────────────────────────
  function handleExportReport() {
    const url = 'http://localhost:5000/api/dashboard/export';
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dashboard-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const statCards = useMemo(() => ([
    { label: 'Total Students', value: summary ? summary.totalStudents.toLocaleString() : '—', trend: 'Live data', icon: Users },
    { label: 'Active Enrollments', value: summary ? summary.activeEnrollments.toLocaleString() : '—', trend: 'Live data', icon: BookOpenCheck },
    { label: 'Pending Payments', value: summary ? summary.pendingPayments.toLocaleString() : '—', trend: 'Live data', icon: BadgeDollarSign },
    { label: 'Active Rides', value: summary ? summary.activeRides.toLocaleString() : '—', trend: 'Live data', icon: BusFront },
    { label: 'Total Revenue', value: summary ? formatCurrency(summary.totalRevenue) : '—', trend: 'Live data', icon: Layers3 },
  ]), [summary]);

  // The backend returns a continuous, zero-filled day series. For short ranges we
  // show one bar per day; for longer ranges (30/90 days) we aggregate into weekly buckets.
  const chartPoints = useMemo(() => {
    if (days < 30) {
      return trendData.map((item: EnrollmentTrendDto) => ({
        label: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
        value: item.enrollments,
        completed: item.completedEnrollments,
      }));
    }

    const weeks = new Map<string, { label: string; value: number; completed: number }>();
    for (const item of trendData) {
      const source = new Date(item.date);
      const day = new Date(Date.UTC(source.getUTCFullYear(), source.getUTCMonth(), source.getUTCDate()));
      const diffToMonday = (day.getUTCDay() + 6) % 7;
      const monday = new Date(day);
      monday.setUTCDate(day.getUTCDate() - diffToMonday);
      const key = monday.toISOString().slice(0, 10);

      const entry = weeks.get(key) ?? {
        label: monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
        value: 0,
        completed: 0,
      };
      entry.value += item.enrollments;
      entry.completed += item.completedEnrollments;
      weeks.set(key, entry);
    }

    return Array.from(weeks.values());
  }, [trendData, days]);

  const maxValue = Math.max(1, ...chartPoints.map((point) => point.value));

  const recentApplicationRows = applications.map((row: StudentApplicationDto) => ({
    ...row,
    dateLabel: formatApplicationDate(row.appliedOn),
  }));

  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-8 lg:pt-8">
      <section className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-on-background">Admin Dashboard</h2>
          <p className="mt-1 text-[16px] leading-6 text-on-surface-variant">Real-time overview of the academic and operational metrics.</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-lg bg-secondary px-6 py-2.5 text-[16px] font-semibold text-on-secondary shadow-md transition-all hover:opacity-90 active:scale-95"
          type="button"
          onClick={handleExportReport}
        >
          <Download className="h-4 w-4" />
          Export Report
        </button>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.label} className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-lowest p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <div className="rounded-lg bg-secondary-fixed p-2">
                  <Icon className="h-5 w-5 text-secondary" />
                </div>
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-secondary">{card.trend}</span>
              </div>
              <p className="mt-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">{card.label}</p>
              <h3 className="text-[24px] font-bold leading-8 text-on-surface">{card.value}</h3>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-lowest shadow-sm">
          <div className="flex items-center justify-between border-b border-outline-variant p-6">
            <div>
              <h4 className="text-title-sm font-semibold text-on-surface">Enrollment Trends</h4>
              <p className="text-body-sm text-on-surface-variant">{days < 30 ? 'Daily student registrations vs course completions' : 'Weekly student registrations vs course completions'}</p>
            </div>
            <select
              className="rounded-lg border-none bg-surface-container-low text-body-sm focus:ring-secondary"
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
              <option value={90}>Last 90 Days</option>
            </select>
          </div>

          <div className="flex min-h-[350px] flex-1 flex-col justify-end gap-4 p-6">
            {trendsQuery.isLoading ? (
              <div className="flex flex-1 items-center justify-center text-on-surface-variant">
                <LoaderCircle className="h-5 w-5 animate-spin" />
              </div>
            ) : chartPoints.length > 0 ? (
              <>
                <div className="flex h-full items-end gap-4 px-4">
                  {chartPoints.map((point, index) => {
                    const height = Math.max(8, Math.round((point.value / maxValue) * 100));

                    return (
                      <div key={`${point.label}-${index}`} className="group relative flex-1 rounded-t-lg bg-secondary/10" style={{ height: `${height}%` }}>
                        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-primary px-2 py-1 text-[10px] text-on-primary opacity-0 transition-opacity group-hover:opacity-100">
                          {point.value} enrollments
                        </div>
                        <div className={`absolute inset-x-0 bottom-0 rounded-t-lg ${index % 3 === 0 ? 'bg-secondary' : index % 3 === 1 ? 'bg-secondary/60' : 'bg-secondary/30'}`} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between px-4 text-body-sm text-outline">
                  {chartPoints.map((point) => (
                    <span key={point.label}>{point.label}</span>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-body-sm text-on-surface-variant">No enrollment trend data available.</div>
            )}
          </div>
        </div>

        <div className="flex h-full flex-col rounded-xl border border-outline-variant bg-surface-lowest shadow-sm">
          <div className="border-b border-outline-variant p-6">
            <h4 className="text-title-sm font-semibold text-on-surface">Recent System Activity</h4>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {activitiesQuery.isLoading ? (
              <div className="flex items-center justify-center py-8 text-on-surface-variant">
                <LoaderCircle className="h-5 w-5 animate-spin" />
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity: ActivityLogDto) => {
                const Icon = activityIconMap[activity.icon as keyof typeof activityIconMap] ?? ClipboardList;

                return (
                  <div key={`${activity.title}-${activity.occurredAt}`} className="flex gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneClasses[activity.tone]}`}>
                      <Icon className="scale-75" />
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
          <div className="border-t border-outline-variant bg-surface-container-low p-4 text-center">
            <button
              type="button"
              className="text-secondary text-[12px] font-semibold uppercase tracking-[0.08em] hover:underline"
              onClick={() => setShowLogsModal(true)}
            >
              View All Logs
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-xl border border-outline-variant bg-surface-lowest shadow-sm">
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h4 className="text-title-sm font-semibold text-on-surface">Recent Student Applications</h4>
          <button
            className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-secondary transition-all hover:bg-secondary/5"
            type="button"
            onClick={() => setShowDirectoryModal(true)}
          >
            View Full Directory
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-outline-variant bg-surface-container-low">
              <tr>
                <th className="px-6 py-4 font-table-header text-table-header text-outline">STUDENT NAME</th>
                <th className="px-6 py-4 font-table-header text-table-header text-outline">COURSE APPLIED</th>
                <th className="px-6 py-4 font-table-header text-table-header text-outline">APP DATE</th>
                <th className="px-6 py-4 font-table-header text-table-header text-outline">STATUS</th>
                <th className="px-6 py-4 font-table-header text-table-header text-outline">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {applicationsQuery.isLoading ? (
                <tr>
                  <td className="px-6 py-8 text-center text-body-sm text-on-surface-variant" colSpan={5}>
                    <span className="inline-flex items-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading applications...</span>
                  </td>
                </tr>
              ) : recentApplicationRows.length > 0 ? (
                recentApplicationRows.map((row: StudentApplicationDto & { dateLabel: string }) => (
                  <tr key={`${row.studentId}-${row.courseId}-${row.appliedOn ?? 'na'}`} className="transition-colors hover:bg-surface-container-low">
                    <td className="px-6 py-4 font-body-sm text-body-sm font-semibold text-on-surface">{row.studentName}</td>
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{row.courseName}</td>
                    <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{row.dateLabel}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${toneClasses[statusTone(row.status)]}`}>{row.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-1 hover:text-secondary" type="button" aria-label={`More actions for ${row.studentName}`}>
                        <EllipsisVertical className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-8 text-center text-body-sm text-on-surface-variant" colSpan={5}>
                    No student applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── View All Logs Modal ─────────────────────────────────── */}
      {showLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowLogsModal(false)}>
          <div className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl border border-outline-variant bg-surface-lowest shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
              <h3 className="text-title-sm font-semibold text-on-surface">All System Logs</h3>
              <button type="button" onClick={() => setShowLogsModal(false)} className="rounded-lg p-1.5 text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {allActivitiesQuery.isLoading ? (
                <div className="flex items-center justify-center py-12"><LoaderCircle className="h-6 w-6 animate-spin text-secondary" /></div>
              ) : (allActivitiesQuery.data ?? []).length > 0 ? (
                (allActivitiesQuery.data ?? []).map((activity: ActivityLogDto) => {
                  const Icon = activityIconMap[activity.icon as keyof typeof activityIconMap] ?? ClipboardList;
                  return (
                    <div key={`${activity.title}-${activity.occurredAt}`} className="flex gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneClasses[activity.tone]}`}>
                        <Icon className="scale-75" />
                      </div>
                      <div>
                        <p className="text-body-sm text-on-surface">{activity.title}</p>
                        <span className="text-[12px] text-outline">{formatRelativeTime(activity.occurredAt)}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-body-sm text-on-surface-variant py-8">No logs available.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── View Full Directory Modal ───────────────────────────── */}
      {showDirectoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowDirectoryModal(false)}>
          <div className="relative w-full max-w-4xl max-h-[85vh] flex flex-col rounded-2xl border border-outline-variant bg-surface-lowest shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
              <h3 className="text-title-sm font-semibold text-on-surface">Full Student Directory</h3>
              <button type="button" onClick={() => setShowDirectoryModal(false)} className="rounded-lg p-1.5 text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {allApplicationsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12"><LoaderCircle className="h-6 w-6 animate-spin text-secondary" /></div>
              ) : (
                <table className="w-full text-left">
                  <thead className="sticky top-0 border-b border-outline-variant bg-surface-container-low">
                    <tr>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-outline">STUDENT NAME</th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-outline">COURSE APPLIED</th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-outline">APP DATE</th>
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-outline">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50">
                    {(allApplicationsQuery.data ?? []).length > 0 ? (
                      (allApplicationsQuery.data ?? []).map((row: StudentApplicationDto) => (
                        <tr key={`all-${row.studentId}-${row.courseId}`} className="transition-colors hover:bg-surface-container-low">
                          <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{row.studentName}</td>
                          <td className="px-6 py-4 text-body-sm text-on-surface-variant">{row.courseName}</td>
                          <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatApplicationDate(row.appliedOn)}</td>
                          <td className="px-6 py-4">
                            <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${toneClasses[statusTone(row.status)]}`}>{row.status}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-body-sm text-on-surface-variant">No student applications found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AdminDashboardPage;