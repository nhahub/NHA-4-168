import { Eye, Pencil, Plus, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DriverStatusBadge } from '../../drivers/DriverStatusBadge';
import { driverStatuses } from '../../drivers/driverUtils';
import { driverService } from '../../services/api/driverService';
import type { DriverDto, DriverStatus } from '../../services/api/driverService';

const pageSize = 10;

const getApiErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong';
};

export default function DriversPage() {
  const location = useLocation();
  const createdDriver = (location.state as { createdDriver?: DriverDto } | null)?.createdDriver;

  // 💡 التعديل هنا: قفلنا الـ State بـ [] عشان نضمن إنه دايماً Array
  const [drivers, setDrivers] = useState<DriverDto[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DriverStatus | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInjectedCreatedDriver, setHasInjectedCreatedDriver] = useState(false);

  useEffect(() => {
    let active = true;

    const loadDrivers = async () => {
      if (createdDriver && !hasInjectedCreatedDriver) {
        setDrivers((currentDrivers) => {
          const exists = currentDrivers.some((driver) => driver.driverSsn === createdDriver.driverSsn);
          return exists ? currentDrivers : [createdDriver, ...currentDrivers];
        });
        setPage(1);
        setHasInjectedCreatedDriver(true);
        setIsLoading(false);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await driverService.getDrivers({
          page,
          pageSize,
          search: search.trim() || undefined,
          status: status || undefined,
        });

        if (!active) return;

        const serverDrivers = response.data || [];
        const shouldIncludeCreatedDriver = Boolean(
          createdDriver && !serverDrivers.some((driver) => driver.driverSsn === createdDriver.driverSsn)
        );
        const mergedDrivers: DriverDto[] = shouldIncludeCreatedDriver && createdDriver
          ? [createdDriver, ...serverDrivers]
          : serverDrivers;

        setDrivers(mergedDrivers);
        setTotalPages(Math.max(response.totalPages, 1));
        setTotalCount(shouldIncludeCreatedDriver ? response.totalCount + 1 : response.totalCount);
      } catch (requestError) {
        if (active) {
          setError(getApiErrorMessage(requestError));
          setDrivers([]); // في حالة الخطأ بنفضي الجدول
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadDrivers();

    return () => {
      active = false;
    };
  }, [page, search, status, createdDriver, hasInjectedCreatedDriver]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: DriverStatus | '') => {
    setStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-display-lg font-bold text-on-background">Drivers</h1>
          <p className="mt-1 text-body-md text-on-surface-variant">{totalCount} records</p>
        </div>
        <Link
          to="/drivers/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Driver
        </Link>
      </section>

      <section className="rounded-xl border border-card-border bg-white shadow-card">
        <div className="flex flex-col gap-3 border-b border-outline-variant p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search by name, license or phone"
              className="w-full rounded-lg border border-input-border py-2 pl-10 pr-3 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
              type="search"
            />
          </div>

          <select
            value={status}
            onChange={(event) => handleStatusChange(event.target.value as DriverStatus | '')}
            className="rounded-lg border border-input-border bg-white px-3 py-2 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          >
            <option value="">All statuses</option>
            {driverStatuses.map((driverStatus) => (
              <option key={driverStatus} value={driverStatus}>
                {driverStatus}
              </option>
            ))}
          </select>
        </div>

        {/* 💡 التعديل هنا: استخدمنا دايماً optional chaining للـ drivers */}
        {error ? (
          <div className="p-6 text-body-sm text-error">{error}</div>
        ) : isLoading ? (
          <div className="p-6 text-body-sm text-on-surface-variant">Loading drivers...</div>
        ) : drivers?.length === 0 ? (
          <div className="p-6 text-body-sm text-on-surface-variant">No drivers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-outline-variant bg-surface-container-low">
                <tr>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">SSN</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Name</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">License Number</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Phone</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Car Info</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Status</th>
                  <th className="px-6 py-4 text-table-header font-semibold text-outline">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {drivers?.map((driver) => (
                  <tr key={driver.driverSsn} className="hover:bg-table-row-hover">
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">{driver.driverSsn}</td>
                    <td className="px-6 py-4 text-body-sm font-semibold text-on-surface">
                      {driver.firstName} {driver.lastName}
                    </td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{driver.licenseNumber}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">{driver.phone || '—'}</td>
                    <td className="px-6 py-4 text-body-sm text-on-surface-variant">
                      {driver.carModel ? `${driver.carModel} (${driver.carPlate})` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <DriverStatusBadge status={driver.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/drivers/${driver.driverSsn}`}
                          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/drivers/${driver.driverSsn}/edit`}
                          className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-outline-variant px-4 py-3">
          <p className="text-body-sm text-on-surface-variant">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={page <= 1}
              className="rounded-lg border border-card-border px-3 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
              disabled={page >= totalPages}
              className="rounded-lg border border-card-border px-3 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}