import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { TripForm } from '../../features/trips/TripForm';
import { getApiErrorMessage, tripService } from '../../services/api/tripService';
import type { TripDto, TripFormPayload } from '../../services/api/tripService';

interface FinderState {
  destination?: string;
  pickupArea?: string;
  estimatedTimeOfArrival?: string;
}

export default function TripFormPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const mode = tripId ? 'edit' : 'create';

  const [trip, setTrip] = useState<TripDto | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finderState = (location.state as FinderState | null) ?? undefined;

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
      } else {
        const created = await tripService.createTrip(payload);
        navigate(`/trips/${created.tripId}`);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-lg font-bold text-on-background">{mode === 'edit' ? 'Edit Trip' : 'New Trip'}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {mode === 'edit' ? `Trip #${tripId}` : 'Fill in the trip details below'}
        </p>
      </div>

      {isLoading ? (
        <p className="text-body-sm text-on-surface-variant">Loading trip...</p>
      ) : (
        <TripForm
          mode={mode}
          initialTrip={trip}
          initialValues={finderState}
          isSubmitting={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
        />
      )}
    </div>
  );
}
