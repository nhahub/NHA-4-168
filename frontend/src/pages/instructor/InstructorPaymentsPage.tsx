import { DollarSign, BookOpenCheck, TrendingUp, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInstructorPayments } from '../../hooks/useInstructorPayments';
import { formatCurrency } from '../../utils/formatters';

export default function InstructorPaymentsPage() {
  const paymentsQuery = useInstructorPayments();
  const data = paymentsQuery.data;

  if (paymentsQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-on-surface-variant">
        <LoaderCircle className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Earnings',
      value: formatCurrency(data?.totalEarned ?? 0),
      icon: DollarSign,
      color: 'text-white',
      bg: 'bg-green-500',
      cardBg: 'bg-green-600',
      titleColor: 'text-green-100',
    },
    {
      title: 'Total Courses Taught',
      value: `${data?.totalCoursesTaught ?? 0}`,
      icon: BookOpenCheck,
      color: 'text-white',
      bg: 'bg-teal-500',
      cardBg: 'bg-teal-700',
      titleColor: 'text-teal-100',
    },
    {
      title: 'Active Course Earnings',
      value: formatCurrency(data?.activeCoursesEarnings ?? 0),
      icon: TrendingUp,
      color: 'text-white',
      bg: 'bg-yellow-600',
      cardBg: 'bg-yellow-500',
      titleColor: 'text-yellow-100',
    },
  ];

  const courses = data?.courses ?? [];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold text-on-background">My Payments</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Your earnings from courses you teach, paid at a flat rate per course.
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
          <h4 className="text-title-sm font-semibold text-on-surface">Course Breakdown</h4>
          <p className="text-body-sm text-on-surface-variant">Earnings per course you're assigned to teach</p>
        </div>

        {courses.length === 0 ? (
          <div className="p-6 text-body-sm text-on-surface-variant">No courses assigned yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Course ID</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Course Name</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Status</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Enrolled Students</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {courses.map((course) => (
                  <tr key={course.courseId} className="hover:bg-table-row-hover">
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{course.courseId}</td>
                     <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">
                       <Link to={`/courses/${course.courseId}`} className="hover:text-secondary">
                         {course.courseName}
                       </Link>
                     </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                          course.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{course.enrolledStudentsCount}</td>
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">
                      {formatCurrency(course.earnings)}
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
