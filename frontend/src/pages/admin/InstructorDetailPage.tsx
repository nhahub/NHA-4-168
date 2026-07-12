import { ArrowLeft, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { formatDate, formatRating, getApiErrorMessage } from '../../features/instructors/instructorUtils';
import { instructorService } from '../../services/api/instructorService';
import type { InstructorDto } from '../../services/api/instructorService';

export default function InstructorDetailPage() {
  const { ssn } = useParams();
  const navigate = useNavigate();
  const parsedSsn = Number(ssn);
  const [instructor, setInstructor] = useState<InstructorDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadInstructor = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await instructorService.getInstructor(parsedSsn);
        if (active) {
          setInstructor(response);
        }
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

    if (Number.isNaN(parsedSsn)) {
      navigate('/instructors', { replace: true });
      return;
    }

    loadInstructor();

    return () => {
      active = false;
    };
  }, [navigate, parsedSsn]);

  if (isLoading) {
    return <div className="rounded-xl border border-card-border bg-surface-lowest p-6 text-body-sm text-on-surface-variant shadow-card">Loading instructor...</div>;
  }

  if (error || !instructor) {
    return <div className="rounded-xl border border-card-border bg-surface-lowest p-6 text-body-sm text-error shadow-card">{error || 'Instructor not found.'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link to="/instructors" className="mb-3 inline-flex items-center gap-2 text-body-sm font-semibold text-secondary">
            <ArrowLeft className="h-4 w-4" />
            Instructors
          </Link>
          <h1 className="text-display-lg font-bold text-on-background">
            {instructor.firstName} {instructor.lastName}
          </h1>
          <p className="mt-1 text-body-md text-on-surface-variant">SSN {instructor.instructorSsn}</p>
        </div>
        <Link
          to={`/instructors/${instructor.instructorSsn}/edit`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-card-border px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Link>
      </div>

      <section className="rounded-xl border border-card-border bg-surface-lowest p-6 shadow-card">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <ProfileField label="Email" value={instructor.email} />
          <ProfileField label="Phone" value={instructor.phone || '—'} />
          <ProfileField label="Specialization" value={instructor.specialization || '—'} />
          <ProfileField label="Rating" value={formatRating(instructor.rating)} />
          <ProfileField label="Hire Date" value={formatDate(instructor.hireDate)} />
        </div>
      </section>

      <section className="rounded-xl border border-card-border bg-surface-lowest shadow-card">
        <div className="border-b border-outline-variant p-6">
          <h2 className="text-title-sm font-semibold text-on-surface">Assigned Courses</h2>
          <p className="mt-1 text-body-sm text-on-surface-variant">Courses this instructor currently teaches.</p>
        </div>

        {instructor.courses.length === 0 ? (
          <div className="p-6 text-body-sm text-on-surface-variant">No courses assigned yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Course</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {instructor.courses.map((course) => (
                  <tr key={course.courseId} className="hover:bg-table-row-hover">
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">
                      <Link to={`/courses/${course.courseId}`} className="hover:text-secondary">
                        {course.courseName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{course.role || '—'}</td>
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

function ProfileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">{label}</p>
      <div className="mt-2 text-body-md font-semibold text-on-surface">{value}</div>
    </div>
  );
}
