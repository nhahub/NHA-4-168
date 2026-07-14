import { useEffect, useState } from 'react';
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

interface RateInstructorDialogProps {
  open: boolean;
  instructorSsn: number;
  onClose: () => void;
}

export function RateInstructorDialog({ open, instructorSsn, onClose }: RateInstructorDialogProps) {
  const { toast } = useToast();
  const [instructor, setInstructor] = useState<InstructorToRateDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (!open || !instructorSsn) return;

    let active = true;
    setIsLoading(true);
    setScore(0);
    setComment('');

    instructorRatingApi.getEligible()
      .then((data) => {
        if (!active) return;
        const found = data.find((i) => i.instructorSsn === instructorSsn) ?? null;
        setInstructor(found);
        if (found?.myScore != null) {
          setScore(found.myScore);
        }
      })
      .catch((err) => {
        if (!active) return;
        toast.error(getApiErrorMessage(err));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, instructorSsn, toast]);

  const handleSubmit = async () => {
    if (!score || !instructor) return;

    setSubmitting(instructor.instructorSsn);
    try {
      await instructorRatingApi.submit({
        instructorSsn: instructor.instructorSsn,
        score,
        comment: comment || null,
      });
      toast.success('Rating submitted. Thank you!');
      onClose();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSubmitting(null);
    }
  };

  if (!open) return null;

  const alreadyRated = instructor?.myScore != null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-card-border bg-surface-lowest p-6 shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface">Rate Instructor</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-outline hover:bg-surface-container-low hover:text-on-surface transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-on-surface-variant">
            <LoaderCircle className="h-8 w-8 animate-spin text-secondary" />
          </div>
        ) : !instructor ? (
          <div className="py-8 text-center text-body-sm text-on-surface-variant">
            Instructor not found or you are not enrolled in any of their courses.
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h3 className="text-title-md font-semibold text-on-surface">
                {instructor.firstName} {instructor.lastName}
              </h3>
              <p className="mt-1 text-body-sm text-on-surface-variant">
                {instructor.courses.join(', ')}
              </p>
            </div>

            {alreadyRated && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[12px] font-bold text-emerald-700">
                <CheckCircle2 size={14} /> Already Rated
              </span>
            )}

            <div>
              <p className="text-sm font-medium text-on-surface mb-2">Your Rating</p>
              <StarRating value={score} onChange={setScore} />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-on-surface">
                Comment {alreadyRated ? '(optional)' : '(optional)'}
              </label>
              <textarea
                className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-secondary"
                rows={3}
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-outline px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container-low"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!score || submitting === instructor?.instructorSsn}
                onClick={handleSubmit}
                className="rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary transition hover:opacity-90 disabled:opacity-60"
              >
                {submitting === instructor?.instructorSsn ? 'Submitting...' : alreadyRated ? 'Update Rating' : 'Submit Rating'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
