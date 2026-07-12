import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StudentForm } from '../../features/students/StudentForm';
import { getApiErrorMessage } from '../../features/students/studentUtils';
import { studentService } from '../../services/api/studentService';
import type { StudentDto, StudentFormPayload } from '../../services/api/studentService';

export default function StudentFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { ssn } = useParams();
  const navigate = useNavigate();
  const studentSsn = Number(ssn);
  const [student, setStudent] = useState<StudentDto | undefined>();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadStudent = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await studentService.getStudent(studentSsn);
        if (active) {
          setStudent(response);
        }
      } catch (requestError) {
        if (active) {
          setLoadError(getApiErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    if (mode === 'edit') {
      if (Number.isNaN(studentSsn)) {
        navigate('/students', { replace: true });
        return;
      }

      loadStudent();
    }

    return () => {
      active = false;
    };
  }, [mode, navigate, studentSsn]);

  const handleSubmit = async (payload: StudentFormPayload) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const saved = mode === 'create'
        ? await studentService.createStudent(payload)
        : await studentService.updateStudent(studentSsn, payload);

      navigate(`/students/${saved.studentSsn}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-card-border bg-surface-lowest p-6 text-body-sm text-on-surface-variant shadow-card">Loading student...</div>;
  }

  if (loadError) {
    return <div className="rounded-xl border border-card-border bg-surface-lowest p-6 text-body-sm text-error shadow-card">{loadError}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to={mode === 'edit' && student ? `/students/${student.studentSsn}` : '/students'} className="mb-3 inline-flex items-center gap-2 text-body-sm font-semibold text-secondary">
          <ArrowLeft className="h-4 w-4" />
          {mode === 'edit' ? 'Student Profile' : 'Students'}
        </Link>
        <h1 className="text-display-lg font-bold text-on-background">{mode === 'create' ? 'Add Student' : 'Edit Student'}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {mode === 'create' ? 'Create a student record.' : student ? `${student.firstName} ${student.lastName}` : ''}
        </p>
      </div>

      <StudentForm
        mode={mode}
        initialStudent={student}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate(mode === 'edit' && student ? `/students/${student.studentSsn}` : '/students')}
      />
    </div>
  );
}
