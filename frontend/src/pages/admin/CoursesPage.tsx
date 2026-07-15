import { Pencil, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CourseLevelBadge } from '../../features/courses/CourseLevelBadge';
import { EnrollCourseDialog } from '../../features/courses/EnrollCourseDialog';
import {
  courseLevels,
  formatDate,
  formatFee,
  getApiErrorMessage,
  getMockCourseRating,
} from '../../features/courses/courseUtils';
import { courseService } from '../../services/api/courseService';
import type { CourseLevel, CourseListItemDto } from '../../services/api/courseService';
import { instructorService } from '../../services/api/instructorService';
import enrollmentService from '../../services/api/enrollmentService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { isAdmin } from '../../utils/auth';

const pageSize = 10;

interface EnrollDialogState {
  open: boolean;
  course: CourseListItemDto | null;
  courseRating: number | null;
  instructorName: string | null;
  instructorRating: number | null;
  isLoadingDetails: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const closedEnrollState: EnrollDialogState = {
  open: false,
  course: null,
  courseRating: null,
  instructorName: null,
  instructorRating: null,
  isLoadingDetails: false,
  isSubmitting: false,
  error: null,
};

export default function CoursesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const admin = isAdmin(user?.roles);

  const [courses, setCourses] = useState<CourseListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<CourseLevel | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<number>>(new Set());
  const [enrollState, setEnrollState] = useState<EnrollDialogState>(closedEnrollState);

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

  // Students only: know which courses they're already enrolled in, so we can
  // disable/relabel the Enroll action instead of allowing duplicate enrollments.
  useEffect(() => {
    if (admin || !user) {
      return;
    }

    let active = true;

    const loadEnrollments = async () => {
      try {
        const allEnrollments = await enrollmentService.getAll();
        if (!active) {
          return;
        }
        const studentSsn = user.studentSsn;
        if (!studentSsn) {
          return;
        }
        const ids = new Set(
          allEnrollments.filter((enrollment) => enrollment.studentSsn === studentSsn).map((enrollment) => enrollment.courseId),
        );
        setEnrolledCourseIds(ids);
      } catch {
        // Non-fatal: worst case the student sees "Enroll" on a course they're already in,
        // and the backend can still reject the duplicate on submit.
      }
    };

    loadEnrollments();

    return () => {
      active = false;
    };
  }, [admin, user]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleLevelChange = (value: CourseLevel | '') => {
    setLevel(value);
    setPage(1);
  };

  const openEnrollDialog = async (course: CourseListItemDto) => {
    setEnrollState({ ...closedEnrollState, open: true, course, isLoadingDetails: true });

    try {
      const courseDetail = await courseService.getCourse(course.courseId);
      const primaryInstructor =
        courseDetail.instructors.find((instructor) => instructor.role === 'Lead') ?? courseDetail.instructors[0];

      let instructorRating: number | null = null;
      if (primaryInstructor) {
        try {
          // GET /instructors/{ssn} is restricted to admins or the instructor themselves,
          // so students must look the rating up from the open list endpoint instead.
          const instructorList = await instructorService.getInstructors({ page: 1, pageSize: 1000 });
          const matchedInstructor = instructorList.data.find(
            (instructor) => instructor.instructorSsn === primaryInstructor.instructorSsn,
          );
          instructorRating = matchedInstructor?.rating ?? null;
        } catch {
          instructorRating = null;
        }
      }

      setEnrollState((current) => ({
        ...current,
        courseRating: getMockCourseRating(course.courseId),
        instructorName: primaryInstructor?.fullName ?? null,
        instructorRating,
        isLoadingDetails: false,
      }));
    } catch (requestError) {
      setEnrollState((current) => ({
        ...current,
        isLoadingDetails: false,
        error: getApiErrorMessage(requestError),
      }));
    }
  };

  const handleConfirmEnroll = async () => {
    if (!enrollState.course || !user || !user.studentSsn) {
      return;
    }

    setEnrollState((current) => ({ ...current, isSubmitting: true, error: null }));

    try {
      const enrollment = await enrollmentService.create({
        studentSsn: user.studentSsn,
        courseId: enrollState.course.courseId,
      });

      toast.success(`Enrolled in ${enrollState.course.courseName}.`);
      setEnrolledCourseIds((current) => new Set(current).add(enrollState.course!.courseId));
      // Total Revenue on the admin dashboard comes from this same query key;
      // invalidating it makes the dashboard reflect the new enrollment's fee.
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setEnrollState(closedEnrollState);
      // Send the student straight to payment for the enrollment they just created.
      navigate(`/student/payments/${enrollment.enrollmentId}/complete`);
    } catch (requestError) {
      setEnrollState((current) => ({
        ...current,
        isSubmitting: false,
        error: getApiErrorMessage(requestError),
      }));
    }
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-on-background mb-8">Courses</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">{totalCount} records</p>
        </div>
        {admin ? (
          <Link
            to="/courses/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Course
          </Link>
        ) : null}
      </section>

      <section className="rounded-xl border border-card-border bg-surface-lowest shadow-card">
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
            className="rounded-lg border border-input-border bg-surface-lowest px-3 py-2 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
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
                {courses.map((course) => {
                  const alreadyEnrolled = enrolledCourseIds.has(course.courseId);

                  return (
                    <tr key={course.courseId} className="hover:bg-table-row-hover">
                      <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{course.courseId}</td>
                      <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">
                        <Link to={`/courses/${course.courseId}`} className="hover:text-secondary">
                          {course.courseName}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <CourseLevelBadge level={course.level} />
                      </td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatFee(course.fee, course.isPaid)}</td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatDate(course.startDate)}</td>
                      <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                        {course.maxCapacity ? `${course.enrolledCount} / ${course.maxCapacity}` : course.enrolledCount}
                      </td>
                      <td className="px-6 py-4">
                        {admin ? (
                          <Link
                            to={`/courses/${course.courseId}/edit`}
                            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                            aria-label={`Edit ${course.courseName}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openEnrollDialog(course)}
                            disabled={alreadyEnrolled}
                            className="rounded-lg bg-secondary px-3 py-1.5 text-body-sm font-semibold text-on-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {alreadyEnrolled ? 'Enrolled' : 'Enroll'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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

      <EnrollCourseDialog
        open={enrollState.open}
        courseName={enrollState.course?.courseName ?? ''}
        fee={enrollState.course?.fee}
        isPaid={enrollState.course?.isPaid ?? false}
        courseRating={enrollState.courseRating}
        instructorName={enrollState.instructorName}
        instructorRating={enrollState.instructorRating}
        isLoadingDetails={enrollState.isLoadingDetails}
        isSubmitting={enrollState.isSubmitting}
        error={enrollState.error}
        onCancel={() => setEnrollState(closedEnrollState)}
        onConfirm={handleConfirmEnroll}
      />
    </div>
  );
}
