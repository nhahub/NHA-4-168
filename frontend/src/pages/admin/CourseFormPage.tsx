import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CourseForm } from '../../features/courses/CourseForm';
import { getApiErrorMessage } from '../../features/courses/courseUtils';
import { courseService } from '../../services/api/courseService';
import type { CourseDto, CourseFormPayload } from '../../services/api/courseService';

export default function CourseFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const parsedCourseId = Number(courseId);
  const [course, setCourse] = useState<CourseDto | undefined>();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await courseService.getCourse(parsedCourseId);
        if (active) {
          setCourse(response);
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
      if (Number.isNaN(parsedCourseId)) {
        navigate('/courses', { replace: true });
        return;
      }

      loadCourse();
    }

    return () => {
      active = false;
    };
  }, [mode, navigate, parsedCourseId]);

  const handleSubmit = async (payload: CourseFormPayload) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const saved = mode === 'create'
        ? await courseService.createCourse(payload)
        : await courseService.updateCourse(parsedCourseId, payload);

      navigate(`/courses/${saved.courseId}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-card-border bg-white p-6 text-body-sm text-on-surface-variant shadow-card">Loading course...</div>;
  }

  if (loadError) {
    return <div className="rounded-xl border border-card-border bg-white p-6 text-body-sm text-error shadow-card">{loadError}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to={mode === 'edit' && course ? `/courses/${course.courseId}` : '/courses'} className="mb-3 inline-flex items-center gap-2 text-body-sm font-semibold text-secondary">
          <ArrowLeft className="h-4 w-4" />
          {mode === 'edit' ? 'Course Details' : 'Courses'}
        </Link>
        <h1 className="text-display-lg font-bold text-on-background">{mode === 'create' ? 'Add Course' : 'Edit Course'}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {mode === 'create' ? 'Create a new course offering.' : course ? course.courseName : ''}
        </p>
      </div>

      <CourseForm
        mode={mode}
        initialCourse={course}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate(mode === 'edit' && course ? `/courses/${course.courseId}` : '/courses')}
      />
    </div>
  );
}
