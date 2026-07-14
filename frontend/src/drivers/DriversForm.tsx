import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { DriverDto, DriverFormPayload, DriverStatus } from '../services/api/driverService';
import { driverStatuses } from './driverUtils';

// دالة مساعدة لتنظيف الحقول النصية الفاضية وتحويلها لـ null
const emptyToNull = (value: string) => (value.trim() === '' ? null : value.trim());

interface DriverFormProps {
  mode: 'create' | 'edit';
  initialDriver?: DriverDto;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (payload: DriverFormPayload) => Promise<void>;
  onCancel: () => void;
}

export function DriverForm({ mode, initialDriver, isSubmitting, error, onSubmit, onCancel }: DriverFormProps) {
  // تجميع القيم المبدئية مع تحويل الأرقام لنصوص عشان الـ Inputs
  const initialValues = useMemo(() => ({
    driverSsn: initialDriver?.driverSsn ? String(initialDriver.driverSsn) : '',
    firstName: initialDriver?.firstName ?? '',
    lastName: initialDriver?.lastName ?? '',
    phone: initialDriver?.phone ?? '',
    licenseNumber: initialDriver?.licenseNumber ?? '',
    carModel: initialDriver?.carModel ?? '',
    carPlate: initialDriver?.carPlate ?? '',
    carYear: initialDriver?.carYear ? String(initialDriver.carYear) : String(new Date().getFullYear()),
    userId: initialDriver?.userId ?? '',
    status: initialDriver?.status ?? 'Active',
  }), [initialDriver]);

  const [values, setValues] = useState(initialValues);

  const updateField = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    
    // تحويل البيانات للشكل النهائي اللي الـ API مستنياه (تحويل الأرقام والـ nulls)
    await onSubmit({
      driverSsn: Number(values.driverSsn),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: emptyToNull(values.phone),
      licenseNumber: values.licenseNumber.trim(),
      carModel: emptyToNull(values.carModel),
      carPlate: emptyToNull(values.carPlate),
      carYear: Number(values.carYear),
      userId: emptyToNull(values.userId),
      status: (values.status as DriverStatus) || 'Active',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-card-border bg-surface-lowest p-6 shadow-card">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        
        {/* Driver SSN */}
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Driver SSN (National ID)
          <input
            required
            type="number"
            disabled={mode === 'edit'} // بنقفل التعديل عليه لو بنعمل Edit لأن الـ SSN هو الـ Primary Key
            value={values.driverSsn}
            onChange={(event) => updateField('driverSsn', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus disabled:bg-surface-container-low disabled:text-on-surface-variant"
          />
        </label>

        {/* License Number */}
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          License Number
          <input
            required
            value={values.licenseNumber}
            onChange={(event) => updateField('licenseNumber', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        {/* First Name */}
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          First Name
          <input
            required
            value={values.firstName}
            onChange={(event) => updateField('firstName', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        {/* Last Name */}
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Last Name
          <input
            required
            value={values.lastName}
            onChange={(event) => updateField('lastName', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        {/* Phone */}
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Phone Number
          <input
            required
            value={values.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        {/* Status */}
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Status
          <select
            value={values.status}
            onChange={(event) => updateField('status', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border bg-surface-lowest px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          >
            {driverStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>

        {/* Car Model */}
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Car Model
          <input
            value={values.carModel}
            onChange={(event) => updateField('carModel', event.target.value)}
            placeholder="e.g. Toyota Corolla"
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        {/* Car Plate */}
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Car Plate
          <input
            value={values.carPlate}
            onChange={(event) => updateField('carPlate', event.target.value)}
            placeholder="e.g. أ ب ج 123"
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        {/* Car Year */}
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Car Year
          <input
            type="number"
            value={values.carYear}
            onChange={(event) => updateField('carYear', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        {/* User ID (Optional link to system user) */}
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant md:col-span-2">
          System User ID (Optional)
          <input
            value={values.userId}
            onChange={(event) => updateField('userId', event.target.value)}
            placeholder="Paste User Guid if applicable"
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>
      </div>

      {error ? <p className="mt-5 text-body-sm text-error">{error}</p> : null}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-card-border px-4 py-2 text-body-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Driver' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}