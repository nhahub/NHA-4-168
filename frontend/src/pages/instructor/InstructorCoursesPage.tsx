import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, X, LoaderCircle } from 'lucide-react';
import { useInstructorCourses } from '../../hooks/useInstructorCourses';
import { useInstructorCourseStudents } from '../../hooks/useInstructorCourseStudents';

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function InstructorCoursesPage() {
  const coursesQuery = useInstructorCourses();
  const courses = coursesQuery.data ?? [];

  const [search, setSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const studentsQuery = useInstructorCourseStudents(selectedCourseId);
  const selectedCourse = courses.find((c) => c.courseId === selectedCourseId) ?? null;

  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold text-on-background">My Courses</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Courses you're assigned to teach. Click a row to see enrolled students.
        </p>
      </section>

      <section className="rounded-xl border border-card-border bg-surface-lowest shadow-card">
        <div className="border-b border-outline-variant p-4">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search course name"
              className="w-full rounded-lg border border-input-border py-2 pl-10 pr-3 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
              type="search"
            />
          </div>
        </div>

        {coursesQuery.isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <LoaderCircle className="h-6 w-6 animate-spin text-secondary" />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-6 text-body-sm text-on-surface-variant">No courses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Course ID</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Course Name</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Role</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Enrolled Students</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Start Date</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredCourses.map((course) => (
                  <tr
                    key={course.courseId}
                    className="transition-colors hover:bg-table-row-hover"
                  >
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{course.courseId}</td>
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">
                      <Link to={`/courses/${course.courseId}`} className="hover:text-secondary">
                        {course.courseName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{course.role || 'Primary Instructor'}</td>
                    <td className="px-6 py-4 text-body-sm">
                      <button
                        type="button"
                        onClick={() => setSelectedCourseId(course.courseId)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-body-sm font-semibold text-secondary hover:bg-secondary-fixed transition-colors cursor-pointer"
                      >
                        <Users className="h-3.5 w-3.5" />
                        {course.enrolledStudentsCount}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatDate(course.startDate)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[12px] font-bold ${
                          course.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {course.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedCourseId !== null ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 p-0 sm:p-4">
          <div className="flex h-full w-full max-w-md flex-col rounded-none bg-surface-lowest shadow-xl sm:h-auto sm:max-h-[85vh] sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant p-5">
              <div>
                <h2 className="text-title-sm font-semibold text-on-surface">{selectedCourse?.courseName ?? 'Course'}</h2>
                <p className="text-body-sm text-on-surface-variant">Enrolled students</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCourseId(null)}
                className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {studentsQuery.isLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <LoaderCircle className="h-6 w-6 animate-spin text-secondary" />
                </div>
              ) : (studentsQuery.data ?? []).length === 0 ? (
                <div className="p-6 text-center text-body-sm text-on-surface-variant">No students enrolled yet.</div>
              ) : (
                <ul className="divide-y divide-outline-variant/60">
                  {(studentsQuery.data ?? []).map((student) => (
                    <li key={student.studentSsn} className="flex items-center justify-between gap-4 p-4">
                      <div className="min-w-0">
                        <p className="truncate text-body-sm font-semibold text-on-surface">{student.studentName}</p>
                        <p className="truncate text-[12px] text-on-surface-variant">{student.email}</p>
                        <p className="mt-1 text-[11px] text-outline">Enrolled {formatDate(student.enrolledOn)}</p>
                      </div>
                       <div className="flex shrink-0 flex-col items-end gap-1">
                         <StatusBadge status={student.status} />
                         {student.grade ? (
                           <span className="text-[11px] font-semibold text-on-surface-variant">Grade: {student.grade}</span>
                         ) : null}
                       </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Paid: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    Unpaid: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    Completed: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
    Withdrawn: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    'N/A': 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
    Failed: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };

  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
        styles[status] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300'
      }`}
    >
      {status}
    </span>
  );
}
