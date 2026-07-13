import { useMemo } from 'react';
import { BookOpen, Users, Star, GraduationCap, ClipboardList, LoaderCircle } from 'lucide-react';
import { useInstructorSummary } from '../hooks/useInstructorSummary';
import { useInstructorCourses } from '../hooks/useInstructorCourses';
import { useInstructorActivities } from '../hooks/useInstructorActivities';

const activityIconMap = {
  GraduationCap,
  ClipboardList,
};

const toneClasses = {
  info: 'bg-secondary-fixed text-secondary',
  success: 'bg-emerald-100 text-emerald-700',
  danger: 'bg-rose-100 text-rose-700',
  neutral: 'bg-slate-100 text-slate-700',
};

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

export default function InstructorDashboardPage() {
  const summaryQuery = useInstructorSummary();
  const coursesQuery = useInstructorCourses();
  const activitiesQuery = useInstructorActivities(5);

  const summary = summaryQuery.data;
  const courses = coursesQuery.data ?? [];
  const activities = activitiesQuery.data ?? [];

  const statCards = useMemo(() => ([
    { label: 'Active Courses', value: summary?.activeCourses ?? 0, icon: BookOpen },
    { label: 'Enrolled Students', value: summary?.totalStudents ?? 0, icon: Users },
    { label: 'Instructor Rating', value: summary?.rating != null ? `${summary.rating} / 5` : '—', icon: Star },
  ]), [summary]);

  const isLoading = summaryQuery.isLoading || coursesQuery.isLoading || activitiesQuery.isLoading;

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
        <h2 className="text-[36px] font-bold leading-[44px] tracking-[-0.02em] text-on-background">Instructor Dashboard</h2>
        <p className="mt-1 text-[16px] leading-6 text-on-surface-variant">Overview of your courses, active students, and teaching metrics.</p>
      </section>

      {/* Stats Cards */}
      <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
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

      {/* Split layout: Left: Courses Taught, Right: Recent Activity */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Courses Table */}
        <div className="lg:col-span-2 flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-lowest shadow-sm">
          <div className="border-b border-outline-variant p-6">
            <h4 className="text-title-sm font-semibold text-on-surface">My Assigned Courses</h4>
            <p className="text-body-sm text-on-surface-variant">List of courses you are currently assigned to teach</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">COURSE NAME</th>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">ROLE</th>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">ENROLLED STUDENTS</th>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">START DATE</th>
                  <th className="px-6 py-4 font-table-header text-table-header text-outline">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {courses.length > 0 ? (
                  courses.map((course) => (
                    <tr key={course.courseId} className="transition-colors hover:bg-surface-container-low">
                      <td className="px-6 py-4 font-body-sm text-body-sm font-semibold text-on-surface">{course.courseName}</td>
                      <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{course.role || 'Primary Instructor'}</td>
                      <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">{course.enrolledStudentsCount} students</td>
                      <td className="px-6 py-4 font-body-sm text-body-sm text-on-surface-variant">
                        {course.startDate ? new Date(course.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-[12px] font-bold ${course.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                          {course.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-8 text-center text-body-sm text-on-surface-variant" colSpan={5}>
                      No courses assigned.
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
            <h4 className="text-title-sm font-semibold text-on-surface">Recent Course Activity</h4>
            <p className="text-body-sm text-on-surface-variant">Latest updates from your active student cohorts</p>
          </div>
          <div className="flex-1 space-y-6 overflow-y-auto p-6">
            {activities.length > 0 ? (
              activities.map((activity, index) => {
                const Icon = activityIconMap[activity.icon as keyof typeof activityIconMap] ?? GraduationCap;
                const tone = activity.tone as keyof typeof toneClasses;
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
