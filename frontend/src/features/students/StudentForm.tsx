import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { StudentDto, StudentFormPayload, StudentStatus } from '../../services/api/studentService';
import { emptyToNull, toDateInputValue } from './studentUtils';

interface StudentFormProps {
  mode: 'create' | 'edit';
  initialStudent?: StudentDto;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (payload: StudentFormPayload) => Promise<void>;
  onCancel: () => void;
}

const STUDENT_STATUSES: StudentStatus[] = ['Active', 'Inactive', 'Graduated', 'Suspended'];

export function StudentForm({ mode, initialStudent, isSubmitting, error, onSubmit, onCancel }: StudentFormProps) {
  const initialValues = useMemo(() => ({
    studentSsn: initialStudent?.studentSsn ? String(initialStudent.studentSsn) : '',
    firstName: initialStudent?.firstName ?? '',
    lastName: initialStudent?.lastName ?? '',
    email: initialStudent?.email ?? '',
    phone: initialStudent?.phone ?? '',
    dateOfBirth: toDateInputValue(initialStudent?.dateOfBirth),
    address: initialStudent?.address ?? '',
    enrollmentDate: toDateInputValue(initialStudent?.enrollmentDate),
    status: initialStudent?.status ?? 'Active',
  }), [initialStudent]);

  const [values, setValues] = useState(initialValues);

  const updateField = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      studentSsn: mode === 'create' && values.studentSsn.trim() ? Number(values.studentSsn) : undefined,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: emptyToNull(values.phone),
      dateOfBirth: emptyToNull(values.dateOfBirth),
      address: emptyToNull(values.address),
      enrollmentDate: emptyToNull(values.enrollmentDate),
      status: mode === 'create' ? (values.status as StudentStatus) : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-card-border bg-surface-lowest p-6 shadow-card">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {mode === 'create' ? (
          <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
            SSN (optional — auto-generated if left blank)
            <input
              type="text"
              inputMode="numeric"
              value={values.studentSsn}
              onChange={(event) => updateField('studentSsn', event.target.value)}
              className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
            />
          </label>
        ) : null}

        {mode === 'create' ? (
          <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
            Status
            <select
              value={values.status}
              onChange={(event) => updateField('status', event.target.value)}
              className="mt-2 w-full rounded-lg border border-input-border bg-surface-lowest px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
            >
              {STUDENT_STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          First Name
          <input
            required
            value={values.firstName}
            onChange={(event) => updateField('firstName', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Last Name
          <input
            required
            value={values.lastName}
            onChange={(event) => updateField('lastName', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Email
          <input
            required
            type="email"
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Phone
          <input
            value={values.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Date of Birth
          <input
            type="date"
            value={values.dateOfBirth}
            onChange={(event) => updateField('dateOfBirth', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Enrollment Date
          <input
            type="date"
            value={values.enrollmentDate}
            onChange={(event) => updateField('enrollmentDate', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant md:col-span-2">
          Address
          <textarea
            value={values.address}
            onChange={(event) => updateField('address', event.target.value)}
            rows={4}
            className="mt-2 w-full resize-y rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
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
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Student' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
