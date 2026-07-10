import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DriverForm } from '../../drivers/DriversForm';
import { driverService } from '../../services/api/driverService';
import type { DriverDto, DriverFormPayload } from '../../services/api/driverService';
import { getApiErrorMessage } from '../../utils/errorMessage';

export default function DriverFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { ssn } = useParams();
  const navigate = useNavigate();
  const driverSsn = Number(ssn);
  
  const [driver, setDriver] = useState<DriverDto | undefined>();
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadDriver = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response = await driverService.getDriverBySsn(driverSsn);
        if (active) {
          setDriver(response);
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
      if (Number.isNaN(driverSsn)) {
        navigate('/drivers', { replace: true });
        return;
      }

      loadDriver();
    }

    return () => {
      active = false;
    };
  }, [mode, navigate, driverSsn]);

  const handleSubmit = async (payload: DriverFormPayload) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // بناءً على الـ Mode بيقرر يبعت POST لكرييت أو PUT للتعديل
      const saved = mode === 'create'
        ? await driverService.createDriver(payload)
        : await driverService.updateDriver(driverSsn, payload);

      if (mode === 'create') {
        navigate('/drivers', { replace: true, state: { createdDriver: saved } });
        return;
      }

      navigate(`/drivers/${saved.driverSsn}`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-card-border bg-white p-6 text-body-sm text-on-surface-variant shadow-card">Loading driver...</div>;
  }

  if (loadError) {
    return <div className="rounded-xl border border-card-border bg-white p-6 text-body-sm text-error shadow-card">{loadError}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link 
          to={mode === 'edit' && driver ? `/drivers/${driver.driverSsn}` : '/drivers'} 
          className="mb-3 inline-flex items-center gap-2 text-body-sm font-semibold text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          {mode === 'edit' ? 'Driver Profile' : 'Drivers'}
        </Link>
        <h1 className="text-display-lg font-bold text-on-background">
          {mode === 'create' ? 'Add Driver' : 'Edit Driver'}
        </h1>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {mode === 'create' ? 'Create a driver record.' : driver ? `${driver.firstName} ${driver.lastName}` : ''}
        </p>
      </div>

      <DriverForm
        mode={mode}
        initialDriver={driver}
        isSubmitting={isSubmitting}
        error={error}
        onSubmit={handleSubmit}
        onCancel={() => navigate(mode === 'edit' && driver ? `/drivers/${driver.driverSsn}` : '/drivers')}
      />
    </div>
  );
}