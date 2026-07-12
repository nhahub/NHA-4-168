import { Eye, Pencil, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { StudentStatusBadge } from '../../features/students/StudentStatusBadge';
import { formatDate, getApiErrorMessage, studentStatuses } from '../../features/students/studentUtils';
import { studentService } from '../../services/api/studentService';
import type { StudentListItemDto, StudentStatus } from '../../services/api/studentService';

const pageSize = 10;

export default function StudentsPage() {
  const [searchParams] = useSearchParams();
  const [students, setStudents] = useState<StudentListItemDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [status, setStatus] = useState<StudentStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadStudents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await studentService.getStudents({
          page,
          pageSize,
          search: search.trim() || undefined,
          status: status || undefined,
        });

        if (!active) {
          return;
        }

        setStudents(response.data);
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

    loadStudents();

    return () => {
      active = false;
    };
  }, [page, search, status]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: StudentStatus | '') => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-display-lg font-bold text-on-background">Students</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">{totalCount} records</p>
        </div>
        <Link
          to="/students/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Student
        </Link>
      </section>

      <section className="rounded-xl border border-card-border bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search name or email"
              className="w-full rounded-lg border border-input-border py-2 pl-10 pr-3 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
              type="search"
            />
          </div>

          <select
            value={status}
            onChange={(event) => handleStatusChange(event.target.value as StudentStatus | '')}
            className="rounded-lg border border-input-border bg-white px-3 py-2 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          >
            <option value="">All statuses</option>
            {studentStatuses.map((studentStatus) => (
              <option key={studentStatus} value={studentStatus}>
                {studentStatus}
              </option>
            ))}
          </select>
        </div>

        {error ? (
          <div className="p-6 text-body-sm text-error">{error}</div>
        ) : isLoading ? (
          <div className="p-6 text-body-sm text-on-surface-variant">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="p-6 text-body-sm text-on-surface-variant">No students found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">SSN</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Name</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Email</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Phone</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Enrollment</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Status</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {students.map((student) => (
                  <tr key={student.studentSsn} className="hover:bg-table-row-hover">
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{student.studentSsn}</td>
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{student.email}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{student.phone || '—'}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{formatDate(student.enrollmentDate)}</td>
                    <td className="px-6 py-4">
                      <StudentStatusBadge status={student.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/students/${student.studentSsn}`}
                          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                          aria-label={`View ${student.firstName} ${student.lastName}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/students/${student.studentSsn}/edit`}
                          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                          aria-label={`Edit ${student.firstName} ${student.lastName}`}
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
