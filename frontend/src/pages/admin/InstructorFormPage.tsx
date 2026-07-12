import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { InstructorForm } from '../../features/instructors/InstructorForm';
import { getApiErrorMessage } from '../../features/instructors/instructorUtils';
import { instructorService } from '../../services/api/instructorService';
import type { InstructorDto, InstructorFormPayload } from '../../services/api/instructorService';

export default function InstructorFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { ssn } = useParams();
  const navigate = useNavigate();
  const parsedSsn = Number(ssn);
  const [instructor, setInstructor] = useState<InstructorDto | undefined>();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadInstructor = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await instructorService.getInstructor(parsedSsn);
        if (active) {
          setInstructor(response);
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
      if (Number.isNaN(parsedSsn)) {
        navigate('/instructors', { replace: true });
        return;
      }

      loadInstructor();
    }

    return () => {
      active = false;
    };
  }, [mode, navigate, parsedSsn]);

  const handleSubmit = async (payload: InstructorFormPayload) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const saved = mode === 'create'
        ? await instructorService.createInstructor(payload)
        : await instructorService.updateInstructor(parsedSsn, payload);

      navigate(`/instructors/${saved.instructorSsn}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-card-border bg-white p-6 text-body-sm text-on-surface-variant shadow-card">Loading instructor...</div>;
  }

  if (loadError) {
    return <div className="rounded-xl border border-card-border bg-white p-6 text-body-sm text-error shadow-card">{loadError}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={mode === 'edit' && instructor ? `/instructors/${instructor.instructorSsn}` : '/instructors'}
          className="mb-3 inline-flex items-center gap-2 text-body-sm font-semibold text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          {mode === 'edit' ? 'Instructor Details' : 'Instructors'}
        </Link>
        <h1 className="text-display-lg font-bold text-on-background">{mode === 'create' ? 'Add Instructor' : 'Edit Instructor'}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {mode === 'create' ? 'Register a new instructor.' : instructor ? `${instructor.firstName} ${instructor.lastName}` : ''}
        </p>
      </div>

      <InstructorForm
        mode={mode}
        initialInstructor={instructor}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate(mode === 'edit' && instructor ? `/instructors/${instructor.instructorSsn}` : '/instructors')}
      />
    </div>
  );
}
