import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { InstructorDto, InstructorFormPayload } from '../../services/api/instructorService';
import { emptyToNull, toDateInputValue } from './instructorUtils';

interface InstructorFormProps {
  mode: 'create' | 'edit';
  initialInstructor?: InstructorDto;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (payload: InstructorFormPayload) => Promise<void>;
  onCancel: () => void;
}

export function InstructorForm({ mode, initialInstructor, isSubmitting, error, onSubmit, onCancel }: InstructorFormProps) {
  const initialValues = useMemo(() => ({
    firstName: initialInstructor?.firstName ?? '',
    lastName: initialInstructor?.lastName ?? '',
    email: initialInstructor?.email ?? '',
    phone: initialInstructor?.phone ?? '',
    specialization: initialInstructor?.specialization ?? '',
    hireDate: toDateInputValue(initialInstructor?.hireDate),
  }), [initialInstructor]);

  const [values, setValues] = useState(initialValues);

  const updateField = (field: keyof typeof values, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: emptyToNull(values.phone),
      specialization: emptyToNull(values.specialization),
      hireDate: emptyToNull(values.hireDate),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-card-border bg-white p-6 shadow-card">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
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
          Specialization
          <input
            value={values.specialization}
            onChange={(event) => updateField('specialization', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Hire Date
          <input
            type="date"
            value={values.hireDate}
            onChange={(event) => updateField('hireDate', event.target.value)}
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
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Instructor' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
