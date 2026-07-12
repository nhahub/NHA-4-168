import { Eye, Pencil, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CourseLevelBadge } from '../../features/courses/CourseLevelBadge';
import { courseLevels, formatDate, formatFee, getApiErrorMessage } from '../../features/courses/courseUtils';
import { courseService } from '../../services/api/courseService';
import type { CourseLevel, CourseListItemDto } from '../../services/api/courseService';

const pageSize = 10;

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<CourseLevel | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCourses = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await courseService.getCourses({
          page,
          pageSize,
          search: search.trim() || undefined,
          level: level || undefined,
        });

        if (!active) {
          return;
        }

        setCourses(response.data);
        setTotalPages(Math.max(response.totalPages, 1));
        setTotalCount(response.totalCount);
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      active = false;
    };
  }, [page, search, level]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleLevelChange = (value: CourseLevel | '') => {
    setLevel(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-display-lg font-bold text-on-background">Courses</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">{totalCount} records</p>
        </div>
        <Link
          to="/courses/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Course
        </Link>
      </section>

      <section className="rounded-xl border border-card-border bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search name or description"
              className="w-full rounded-lg border border-input-border py-2 pl-10 pr-3 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
              type="search"
            />
          </div>

          <select
            value={level}
            onChange={(event) => handleLevelChange(event.target.value as CourseLevel | '')}
            className="rounded-lg border border-input-border bg-white px-3 py-2 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          >
            <option value="">All levels</option>
            {courseLevels.map((courseLevel) => (
              <option key={courseLevel} value={courseLevel}>
                {courseLevel}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="p-6 text-body-sm text-error">{error}</div>
        ) : isLoading ? (
          <div className="p-6 text-body-sm text-on-surface-variant">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="p-6 text-body-sm text-on-surface-variant">No courses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">ID</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Name</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Level</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Fee</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Starts</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Seats</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {courses.map((course) => (
                  <tr key={course.courseId} className="hover:bg-table-row-hover">
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{course.courseId}</td>
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{course.courseName}</td>
                    <td className="px-6 py-4">
                      <CourseLevelBadge level={course.level} />
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatFee(course.fee, course.isPaid)}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatDate(course.startDate)}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                      {course.maxCapacity ? `${course.enrolledCount} / ${course.maxCapacity}` : course.enrolledCount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/courses/${course.courseId}`}
                          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                          aria-label={`View ${course.courseName}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/courses/${course.courseId}/edit`}
                          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                          aria-label={`Edit ${course.courseName}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-outline-variant px-4 py-3">
          <p className="text-body-sm text-on-surface-variant">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={page <= 1}
              className="rounded-lg border border-card-border px-3 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              disabled={page >= totalPages}
              className="rounded-lg border border-card-border px-3 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
