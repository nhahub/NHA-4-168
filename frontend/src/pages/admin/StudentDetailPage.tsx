import { ArrowLeft, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatusChangeDialog } from '../../features/students/StatusChangeDialog';
import { StudentStatusBadge } from '../../features/students/StudentStatusBadge';
import { formatDate, getApiErrorMessage } from '../../features/students/studentUtils';
import { studentService } from '../../services/api/studentService';
import type { StudentDto, StudentStatus } from '../../services/api/studentService';

export default function StudentDetailPage() {
  const { ssn } = useParams();
  const navigate = useNavigate();
  const studentSsn = Number(ssn);
  const [student, setStudent] = useState<StudentDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<StudentStatus>('Active');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  useEffect(() => {
    let active = true;

    const loadStudent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await studentService.getStudent(studentSsn);
        if (active) {
          setStudent(response);
          setSelectedStatus(response.status);
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

    if (Number.isNaN(studentSsn)) {
      navigate('/students', { replace: true });
      return;
    }

    loadStudent();

    return () => {
      active = false;
    };
  }, [navigate, studentSsn]);

  const handleStatusSave = async () => {
    if (!student) {
      return;
    }

    setIsSavingStatus(true);
    setStatusError(null);

    try {
      const response = await studentService.updateStudentStatus(student.studentSsn, selectedStatus);
      setStudent({ ...student, status: response.status });
      setDialogOpen(false);
    } catch (requestError) {
      setStatusError(getApiErrorMessage(requestError));
    } finally {
      setIsSavingStatus(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-card-border bg-surface-lowest p-6 text-body-sm text-on-surface-variant shadow-card">Loading student...</div>;
  }

  if (error || !student) {
    return <div className="rounded-xl border border-card-border bg-surface-lowest p-6 text-body-sm text-error shadow-card">{error || 'Student not found.'}</div>;
  }

  const studentName = `${student.firstName} ${student.lastName}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link to="/students" className="mb-3 inline-flex items-center gap-2 text-body-sm font-semibold text-secondary">
            <ArrowLeft className="h-4 w-4" />
            Students
          </Link>
          <h1 className="text-display-lg font-bold text-on-background">{studentName}</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">SSN {student.studentSsn}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/students/${student.studentSsn}/edit`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-card-border px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <button
            type="button"
            onClick={() => {
              setSelectedStatus(student.status);
              setDialogOpen(true);
            }}
            className="rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90"
          >
            Change Status
          </button>
        </div>
      </div>

      <section className="rounded-xl border border-card-border bg-surface-lowest p-6 shadow-card">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <ProfileField label="Status" value={<StudentStatusBadge status={student.status} />} />
          <ProfileField label="Email" value={student.email} />
          <ProfileField label="Phone" value={student.phone || '—'} />
          <ProfileField label="Date of Birth" value={formatDate(student.dateOfBirth)} />
          <ProfileField label="Enrollment Date" value={formatDate(student.enrollmentDate)} />
          <ProfileField label="Address" value={student.address || '—'} />
        </div>
      </section>

      <StatusChangeDialog
        open={dialogOpen}
        currentStatus={student.status}
        selectedStatus={selectedStatus}
        studentName={studentName}
        isSubmitting={isSavingStatus}
        error={statusError}
        onSelectedStatusChange={setSelectedStatus}
        onCancel={() => setDialogOpen(false)}
        onConfirm={handleStatusSave}
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
