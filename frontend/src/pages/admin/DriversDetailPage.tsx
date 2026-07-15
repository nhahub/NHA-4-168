import { ArrowLeft, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DriverStatusBadge } from '../../drivers/DriverStatusBadge';
import { driverService } from '../../services/api/driverService';
import type { DriverDto, DriverStatus } from '../../services/api/driverService';
import { isAdmin } from '../../utils/auth';
import { getApiErrorMessage } from '../../utils/errorMessage';

export default function DriverDetailPage() {
  const { ssn } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const driverSsn = Number(ssn);
  const canManageDrivers = isAdmin(user?.roles);
  
  const [driver, setDriver] = useState<DriverDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DriverStatus>('Active');
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDriver = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // استدعاء الميثود من الـ driverService الفعلي اللي عملناه سوا
        const response = await driverService.getDriverBySsn(driverSsn);
        if (active) {
          setDriver(response);
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

    if (Number.isNaN(driverSsn)) {
      navigate('/drivers', { replace: true });
      return;
    }

    loadDriver();

    return () => {
      active = false;
    };
  }, [navigate, driverSsn]);

  const handleStatusSave = async () => {
    if (!driver) return;

    setIsSavingStatus(true);
    setStatusError(null);

    try {
      // تعديل بيانات السواق الأساسية عبر الـ API
      const response = await driverService.updateDriver(driver.driverSsn, {
        driverSsn: driver.driverSsn,
        firstName: driver.firstName,
        lastName: driver.lastName,
        phone: driver.phone,
        licenseNumber: driver.licenseNumber,
        carModel: driver.carModel,
        carPlate: driver.carPlate,
        carYear: driver.carYear,
        userId: driver.userId,
        status: selectedStatus,
      });
      
      setDriver({ ...driver, status: response.status });
      setDialogOpen(false);
    } catch (requestError) {
      setStatusError(getApiErrorMessage(requestError));
    } finally {
      setIsSavingStatus(false);
    }
  };

  if (isLoading) {
    return <div className="rounded-xl border border-card-border bg-surface-lowest p-6 text-body-sm text-on-surface-variant shadow-card">Loading driver...</div>;
  }

  if (error || !driver) {
    return <div className="rounded-xl border border-card-border bg-surface-lowest p-6 text-body-sm text-error shadow-card">{error || 'Driver not found.'}</div>;
  }

  const driverName = `${driver.firstName} ${driver.lastName}`;

  return (
    <div className="space-y-6">
      {/* Header Navigation & Actions */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <Link to="/drivers" className="mb-3 inline-flex items-center gap-2 text-body-sm font-semibold text-secondary">
            <ArrowLeft className="h-4 w-4" />
            Drivers
          </Link>
          <h1 className="text-display-lg font-bold text-on-background">{driverName}</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">SSN {driver.driverSsn}</p>
        </div>
        {canManageDrivers ? (
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/drivers/${driver.driverSsn}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-card-border px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => {
                setSelectedStatus(driver.status);
                setDialogOpen(true);
              }}
              className="rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90"
            >
              Change Status
            </button>
          </div>
        ) : null}
      </div>

      {/* Driver Information Card */}
      <section className="rounded-xl border border-card-border bg-surface-lowest p-6 shadow-card">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <ProfileField label="Status" value={<DriverStatusBadge status={driver.status} />} />
          <ProfileField label="Phone" value={driver.phone || '—'} />
          <ProfileField label="License Number" value={driver.licenseNumber} />
          <ProfileField label="Car Model" value={driver.carModel || '—'} />
          <ProfileField label="Car Plate" value={driver.carPlate || '—'} />
          <ProfileField label="Car Year" value={driver.carYear || '—'} />
        </div>
      </section>

      {canManageDrivers && dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-surface-lowest p-6 shadow-xl border border-card-border">
            <h3 className="text-display-sm font-bold text-on-background mb-2">Change Status</h3>
            <p className="text-body-sm text-on-surface-variant mb-4">Update status for {driverName}</p>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as DriverStatus)}
              className="w-full rounded-lg border border-input-border bg-surface-lowest px-3 py-2 text-body-sm text-on-surface outline-none focus:border-input-border-focus"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>

            {statusError && <p className="mt-2 text-body-sm text-error">{statusError}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low rounded-lg border border-card-border"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingStatus}
                onClick={handleStatusSave}
                className="px-4 py-2 text-body-sm font-semibold text-on-secondary bg-secondary hover:opacity-90 rounded-lg disabled:opacity-50"
              >
                {isSavingStatus ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
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