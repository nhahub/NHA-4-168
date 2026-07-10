import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { TripForm } from '../../features/trips/TripForm';
import { getApiErrorMessage, tripService } from '../../services/api/tripService';
import type { TripDto, TripFormPayload } from '../../services/api/tripService';
import { isAdmin } from '../../utils/auth';
import { addTripSuggestion, removeTripSuggestion, type TripSuggestion } from '../../utils/tripSuggestions';

interface FinderState {
  destination?: string;
  pickupArea?: string;
  estimatedTimeOfArrival?: string;
}

export default function TripFormPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const mode = tripId ? 'edit' : 'create';
  const isAdminUser = isAdmin(user?.roles);
  const isSuggestionMode = mode === 'create' && !isAdminUser;
  const reviewSuggestion = (location.state as { reviewSuggestion?: TripSuggestion } | null)?.reviewSuggestion;
  const isReviewMode = Boolean(reviewSuggestion) && isAdminUser;

  const [trip, setTrip] = useState<TripDto | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finderState = (location.state as FinderState | null) ?? undefined;
  const prefilledValues = reviewSuggestion
    ? {
        destination: reviewSuggestion.destination,
        pickupArea: reviewSuggestion.pickupArea,
        estimatedTimeOfArrival: reviewSuggestion.estimatedTimeOfArrival,
        maxSeats: String(reviewSuggestion.maxSeats),
      }
    : finderState;

  useEffect(() => {
    if (mode !== 'edit' || !tripId) return;
    let active = true;

    tripService
      .getTrip(Number(tripId))
      .then((data) => {
        if (active) setTrip(data);
      })
      .catch((requestError) => {
        if (active) setError(getApiErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [mode, tripId]);

  const handleSubmit = async (payload: TripFormPayload) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'edit' && tripId) {
        const updated = await tripService.updateTrip(Number(tripId), payload);
        navigate(`/trips/${updated.tripId}`);
        return;
      }

      if (isSuggestionMode) {
        const suggestion = {
          id: `${Date.now()}`,
          destination: payload.destination,
          pickupArea: payload.pickupArea,
          estimatedTimeOfArrival: payload.estimatedTimeOfArrival,
          maxSeats: payload.maxSeats,
          submittedBy: user?.id ?? 'student',
          submittedByName: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.email || 'Student',
          submittedAt: new Date().toISOString(),
        };

        addTripSuggestion(suggestion);
        navigate('/trips/all');
        return;
      }

      if (isReviewMode && reviewSuggestion) {
        const created = await tripService.createTrip(payload);
        removeTripSuggestion(reviewSuggestion.id);
        navigate(`/trips/${created.tripId}`);
        return;
      }

      const created = await tripService.createTrip(payload);
      navigate(`/trips/${created.tripId}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-lg font-bold text-on-background">{mode === 'edit' ? 'Edit Trip' : isReviewMode ? 'Review Trip Suggestion' : isSuggestionMode ? 'Suggest a Trip' : 'New Trip'}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {mode === 'edit' ? `Trip #${tripId}` : isReviewMode ? 'Finalize the student suggestion by assigning a driver and price, then save it as a real trip.' : isSuggestionMode ? 'Share your preferred trip details and an administrator will review it.' : 'Fill in the trip details below'}
        </p>
      </div>

      {isLoading ? (
        <p className="text-body-sm text-on-surface-variant">Loading trip...</p>
      ) : (
        <TripForm
          mode={mode}
          initialTrip={trip}
          initialValues={prefilledValues}
          isSuggestionMode={isSuggestionMode}
          reviewMode={isReviewMode}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      )}
    </div>
  );
}
