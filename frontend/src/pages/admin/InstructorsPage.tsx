import { Eye, Pencil, Plus, Search, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatRating, getApiErrorMessage } from '../../features/instructors/instructorUtils';
import { instructorService } from '../../services/api/instructorService';
import type { InstructorListItemDto } from '../../services/api/instructorService';
import { courseService } from '../../services/api/courseService';
import enrollmentService from '../../services/api/enrollmentService';
import { useAuth } from '../../contexts/AuthContext';
import { isAdmin } from '../../utils/auth';
import { RateInstructorDialog } from '../../features/instructors/RateInstructorDialog';

const pageSize = 10;

export default function InstructorsPage() {
  const { user } = useAuth();
  const admin = isAdmin(user?.roles);

  // --- Admin: full paginated, searchable list (unchanged behavior) ---
  const [instructors, setInstructors] = useState<InstructorListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingInstructorSsn, setRatingInstructorSsn] = useState<number | null>(null);

  useEffect(() => {
    if (!admin) {
      return;
    }

    let active = true;

    const loadInstructors = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await instructorService.getInstructors({
          page,
          pageSize,
          search: search.trim() || undefined,
        });

        if (!active) {
          return;
        }

        setInstructors(response.data);
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

    loadInstructors();

    return () => {
      active = false;
    };
  }, [admin, page, search]);

  // --- Student: only instructors teaching a course they're enrolled in ---
  const [myInstructors, setMyInstructors] = useState<InstructorListItemDto[]>([]);
  const [myInstructorsLoading, setMyInstructorsLoading] = useState(true);
  const [myInstructorsError, setMyInstructorsError] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    if (admin || !user) {
      return;
    }

    let active = true;

    const loadMyInstructors = async () => {
      setMyInstructorsLoading(true);
      setMyInstructorsError(null);

      try {
        if (!user.studentSsn) {
          return;
        }
        const studentSsn = user.studentSsn;
        const allEnrollments = await enrollmentService.getAll();
        const myCourseIds = Array.from(
          new Set(allEnrollments.filter((enrollment) => enrollment.studentSsn === studentSsn).map((enrollment) => enrollment.courseId)),
        );

        const courseDetails = await Promise.all(myCourseIds.map((courseId) => courseService.getCourse(courseId)));
        const instructorSsns = Array.from(
          new Set(courseDetails.flatMap((course) => course.instructors.map((instructor) => instructor.instructorSsn))),
        );

        // GET /instructors/{ssn} is restricted to admins or the instructor themselves,
        // so we fetch the open list endpoint once and filter to the ones teaching
        // this student's enrolled courses, instead of calling the single-instructor endpoint.
   // GET /instructors/{ssn} is restricted to admins or the instructor themselves,
// so we page through the open list endpoint and filter to the ones teaching
// this student's enrolled courses, instead of calling the single-instructor endpoint.
let allInstructors: InstructorListItemDto[] = [];
let currentPage = 1;
let totalPages = 1;

do {
  const response = await instructorService.getInstructors({ page: currentPage, pageSize: 100 });
  allInstructors = [...allInstructors, ...response.data];
  totalPages = response.totalPages;
  currentPage++;
} while (currentPage <= totalPages);

const instructorDetails = allInstructors.filter((instructor) =>
  instructorSsns.includes(instructor.instructorSsn),
);

        if (active) {
          setMyInstructors(instructorDetails);
        }
      } catch (requestError) {
        if (active) {
          setMyInstructorsError(getApiErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setMyInstructorsLoading(false);
        }
      }
    };

    loadMyInstructors();

    return () => {
      active = false;
    };
  }, [admin, user]);

  const filteredMyInstructors = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) {
      return myInstructors;
    }
    return myInstructors.filter(
      (instructor) =>
        `${instructor.firstName} ${instructor.lastName}`.toLowerCase().includes(query) ||
        (instructor.specialization ?? '').toLowerCase().includes(query),
    );
  }, [myInstructors, studentSearch]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const rows = admin ? instructors : filteredMyInstructors;
  const listIsLoading = admin ? isLoading : myInstructorsLoading;
  const listError = admin ? error : myInstructorsError;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold text-on-background mb-8">Instructors</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {admin ? `${totalCount} records` : `${filteredMyInstructors.length} records`}
          </p>
        </div>
        {admin ? (
          <Link
            to="/instructors/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Add Instructor
          </Link>
        ) : null}
      </section>

      <section className="rounded-xl border border-card-border bg-surface-lowest shadow-card">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={admin ? search : studentSearch}
              onChange={(event) => (admin ? handleSearchChange(event.target.value) : setStudentSearch(event.target.value))}
              placeholder="Search name or specialization"
              className="w-full rounded-lg border border-input-border py-2 pl-10 pr-3 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
              type="search"
            />
          </div>
        </div>

        {listError ? (
          <div className="p-6 text-body-sm text-error">{listError}</div>
        ) : listIsLoading ? (
          <div className="p-6 text-body-sm text-on-surface-variant">Loading instructors...</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-body-sm text-on-surface-variant">
            {admin ? 'No instructors found.' : "No instructors yet — enroll in a course to see its instructor here."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">SSN</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Name</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Email</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Specialization</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Rating</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Hired</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {rows.map((instructor) => (
                  <tr key={instructor.instructorSsn} className="hover:bg-table-row-hover">
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{instructor.instructorSsn}</td>
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">
                      {instructor.firstName} {instructor.lastName}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{instructor.email}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{instructor.specialization || '—'}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatRating(instructor.rating)}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatDate(instructor.hireDate)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/instructors/${instructor.instructorSsn}`}
                          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                          aria-label={`View ${instructor.firstName} ${instructor.lastName}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {admin ? (
                          <Link
                            to={`/instructors/${instructor.instructorSsn}/edit`}
                            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                            aria-label={`Edit ${instructor.firstName} ${instructor.lastName}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setRatingInstructorSsn(instructor.instructorSsn)}
                            className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                            aria-label={`Rate ${instructor.firstName} ${instructor.lastName}`}
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {admin ? (
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
        ) : null}
      </section>
      {ratingInstructorSsn !== null && (
        <RateInstructorDialog
          open={ratingInstructorSsn !== null}
          instructorSsn={ratingInstructorSsn}
          onClose={() => setRatingInstructorSsn(null)}
        />
      )}
    </div>
  );
}
