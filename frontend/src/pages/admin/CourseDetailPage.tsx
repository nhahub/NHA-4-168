import { ArrowLeft, Pencil, Trash2, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AssignInstructorDialog } from '../../features/courses/AssignInstructorDialog';
import { CourseLevelBadge } from '../../features/courses/CourseLevelBadge';
import { formatDate, formatFee, getApiErrorMessage } from '../../features/courses/courseUtils';
import { courseService } from '../../services/api/courseService';
import type { CourseDto, InstructorAssignmentRole } from '../../services/api/courseService';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin, isInstructor } from '../../utils/auth';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const parsedCourseId = Number(courseId);
  const { user } = useAuth();
  const admin = isAdmin(user?.roles);
  const instructor = isInstructor(user?.roles);
  const [course, setCourse] = useState<CourseDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [removingSsn, setRemovingSsn] = useState<number | null>(null);

  const loadCourse = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await courseService.getCourse(parsedCourseId);
      setCourse(response);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (Number.isNaN(parsedCourseId)) {
      navigate('/courses', { replace: true });
      return;
    }

    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, parsedCourseId]);

  const handleAssignInstructor = async (instructorSsn: number, role: InstructorAssignmentRole | '') => {
    setIsAssigning(true);
    setAssignError(null);

    try {
      await courseService.assignInstructor(parsedCourseId, { instructorSsn, role: role || undefined });
      setDialogOpen(false);
      await loadCourse();
    } catch (requestError) {
      setAssignError(getApiErrorMessage(requestError));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveInstructor = async (instructorSsn: number) => {
    setRemovingSsn(instructorSsn);
    setError(null);

    try {
      await courseService.removeInstructor(parsedCourseId, instructorSsn);
      await loadCourse();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setRemovingSsn(null);
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-card-border bg-surface-lowest p-6 text-body-sm text-on-surface-variant shadow-card">Loading course...</div>;
  }

  if (error || !course) {
    return <div className="rounded-xl border border-card-border bg-surface-lowest p-6 text-body-sm text-error shadow-card">{error || 'Course not found.'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link to={instructor ? '/instructor/courses' : '/courses'} className="mb-3 inline-flex items-center gap-2 text-body-sm font-semibold text-secondary">
            <ArrowLeft className="h-4 w-4" />
            {instructor ? 'My Courses' : 'Courses'}
          </Link>
          <h1 className="text-display-lg font-bold text-on-background">{course.courseName}</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">Course ID {course.courseId}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {admin ? (
            <Link
              to={`/courses/${course.courseId}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-card-border px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          ) : null}
          {admin ? (
            <button
              type="button"
              onClick={() => {
                setAssignError(null);
                setDialogOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Assign Instructor
            </button>
          ) : null}
        </div>
      </div>

      <section className="rounded-xl border border-card-border bg-surface-lowest p-6 shadow-card">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <ProfileField label="Level" value={<CourseLevelBadge level={course.level} />} />
          <ProfileField label="Fee" value={formatFee(course.fee, course.isPaid)} />
          <ProfileField label="Status" value={course.isActive ? 'Active' : 'Inactive'} />
          <ProfileField label="Start Date" value={formatDate(course.startDate)} />
          <ProfileField label="End Date" value={formatDate(course.endDate)} />
          <ProfileField
            label="Enrollment"
            value={course.maxCapacity ? `${course.enrolledCount} / ${course.maxCapacity} seats` : `${course.enrolledCount} enrolled`}
          />
          <ProfileField label="Description" value={course.description || '—'} />
        </div>
      </section>

      <section className="rounded-xl border border-card-border bg-surface-lowest shadow-card">
        <div className="border-b border-outline-variant p-6">
          <h2 className="text-title-sm font-semibold text-on-surface">Assigned Instructors</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">Instructors currently assigned to this course.</p>
        </div>

        {course.instructors.length === 0 ? (
          <div className="p-6 text-body-sm text-on-surface-variant">No instructors assigned yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">SSN</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Name</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Role</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Assigned On</th>
                  {admin ? <th className="px-6 py-4 text-table-header font-semibold text-outline">Actions</th> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {course.instructors.map((instructor) => (
                  <tr key={instructor.instructorSsn} className="hover:bg-table-row-hover">
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{instructor.instructorSsn}</td>
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">
                      <Link to={`/instructors/${instructor.instructorSsn}`} className="hover:text-secondary">
                        {instructor.fullName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{instructor.role || '—'}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatDate(instructor.assignedOn)}</td>
                    {admin ? (
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveInstructor(instructor.instructorSsn)}
                          disabled={removingSsn === instructor.instructorSsn}
                          className="rounded-full p-2 text-on-surface-variant hover:bg-error-container hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Remove ${instructor.fullName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <AssignInstructorDialog
        open={dialogOpen}
        isSubmitting={isAssigning}
        error={assignError}
        onCancel={() => setDialogOpen(false)}
        onConfirm={handleAssignInstructor}
      />
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
      <div className="mt-2 text-body-md font-semibold text-on-surface">{value}</div>
    </div>
  );
}
