import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Star, LoaderCircle, CheckCircle2 } from 'lucide-react';
import { instructorRatingApi, type InstructorToRateDto } from '../../services/api/instructorRatingApi';
import { getApiErrorMessage } from '../../utils/errorMessage';
import { useToast } from '../../contexts/ToastContext';

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (score: number) => void;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hover || value) >= star;
        return (
          <button
            key={star}
            type="button"
            aria-label={`Rate ${star}`}
            className="transition-transform hover:scale-110"
            onMouseEnter={() => setHover(star)}
            onClick={() => onChange(star)}
          >
            <Star
              size={28}
              className={active ? 'fill-amber-400 text-amber-400' : 'text-outline-variant'}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function RateInstructorsPage() {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const targetSsn = searchParams.get('instructor');
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [instructors, setInstructors] = useState<InstructorToRateDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState<number | null>(null);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await instructorRatingApi.getEligible();
      setInstructors(data);
      const initial: Record<number, number> = {};
      const initialComments: Record<number, string> = {};
      for (const instructor of data) {
        if (instructor.myScore != null) {
          initial[instructor.instructorSsn] = instructor.myScore;
          initialComments[instructor.instructorSsn] = '';
        }
      }
      setScores(initial);
      setComments(initialComments);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!targetSsn) {
      return;
    }
    const ssn = Number(targetSsn);
    if (instructors.some((instructor) => instructor.instructorSsn === ssn)) {
      cardRefs.current[ssn]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [instructors, targetSsn]);

  const handleSubmit = async (instructorSsn: number) => {
    const score = scores[instructorSsn];
    if (!score) {
      toast.error('Please select a rating from 1 to 5.');
      return;
    }

    setSubmitting(instructorSsn);
    try {
      await instructorRatingApi.submit({
        instructorSsn,
        score,
        comment: comments[instructorSsn] || null,
      });
      toast.success('Rating submitted. Thank you!');
      await load();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-display-lg font-bold text-on-background">Rate Instructors</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Share your experience with the instructors of the courses you're enrolled in.
        </p>
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-on-surface-variant">
          <LoaderCircle className="h-8 w-8 animate-spin text-secondary" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-card-border bg-surface-lowest p-6 text-body-sm text-error">
          {error}
        </div>
      ) : instructors.length === 0 ? (
        <div className="rounded-xl border border-card-border bg-surface-lowest p-16 text-center">
          <div className="text-6xl mb-6">⭐</div>
          <h3 className="text-headline-md font-bold text-primary mb-2">No instructors to rate yet</h3>
          <p className="text-on-surface-variant max-w-md mx-auto">
            You'll be able to rate instructors once you're enrolled in a course they teach.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {instructors.map((instructor) => {
            const score = scores[instructor.instructorSsn] ?? 0;
            const alreadyRated = instructor.myScore != null;
            return (
              <div
                key={instructor.instructorSsn}
                ref={(element) => {
                  cardRefs.current[instructor.instructorSsn] = element;
                }}
                className={`rounded-xl border bg-surface-lowest p-6 shadow-card ${
                  targetSsn && Number(targetSsn) === instructor.instructorSsn
                    ? 'border-secondary ring-2 ring-secondary'
                    : 'border-card-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-title-md font-semibold text-on-surface">
                      {instructor.firstName} {instructor.lastName}
                    </h4>
                    <p className="mt-1 text-body-sm text-on-surface-variant">
                      {instructor.courses.join(', ')}
                    </p>
                  </div>
                  {alreadyRated ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-bold text-emerald-700">
                      <CheckCircle2 size={14} /> Rated
                    </span>
                  ) : null}
                </div>

                <div className="mt-4">
                  <StarRating
                    value={score}
                    onChange={(selected) =>
                      setScores((prev) => ({ ...prev, [instructor.instructorSsn]: selected }))
                    }
                  />
                </div>

                <textarea
                  className="mt-4 w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-secondary"
                  rows={2}
                  placeholder="Optional comment..."
                  value={comments[instructor.instructorSsn] ?? ''}
                  onChange={(event) =>
                    setComments((prev) => ({
                      ...prev,
                      [instructor.instructorSsn]: event.target.value,
                    }))
                  }
                />

                <button
                  type="button"
                  disabled={submitting === instructor.instructorSsn}
                  onClick={() => handleSubmit(instructor.instructorSsn)}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary transition hover:opacity-90 disabled:opacity-60"
                >
                  {submitting === instructor.instructorSsn ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : null}
                  {alreadyRated ? 'Update rating' : 'Submit rating'}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
