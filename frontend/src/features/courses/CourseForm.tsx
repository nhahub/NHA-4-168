import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import type { CourseDto, CourseFormPayload, CourseLevel } from '../../services/api/courseService';
import { courseLevels, emptyToNull, toDateInputValue } from './courseUtils';

interface CourseFormProps {
  mode: 'create' | 'edit';
  initialCourse?: CourseDto;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (payload: CourseFormPayload) => Promise<void>;
  onCancel: () => void;
}

export function CourseForm({ mode, initialCourse, isSubmitting, error, onSubmit, onCancel }: CourseFormProps) {
  const initialValues = useMemo(() => ({
    courseName: initialCourse?.courseName ?? '',
    description: initialCourse?.description ?? '',
    level: (initialCourse?.level ?? '') as CourseLevel | '',
    fee: initialCourse?.fee !== null && initialCourse?.fee !== undefined ? String(initialCourse.fee) : '',
    isPaid: initialCourse?.isPaid ?? false,
    maxCapacity: initialCourse?.maxCapacity !== null && initialCourse?.maxCapacity !== undefined ? String(initialCourse.maxCapacity) : '',
    startDate: toDateInputValue(initialCourse?.startDate),
    endDate: toDateInputValue(initialCourse?.endDate),
  }), [initialCourse]);

  const [values, setValues] = useState(initialValues);

  const updateField = <K extends keyof typeof values>(field: K, value: typeof values[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit({
      courseName: values.courseName.trim(),
      description: emptyToNull(values.description),
      level: values.level || null,
      fee: values.fee.trim() ? Number(values.fee) : null,
      isPaid: values.isPaid,
      maxCapacity: values.maxCapacity.trim() ? Number(values.maxCapacity) : null,
      startDate: emptyToNull(values.startDate),
      endDate: emptyToNull(values.endDate),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-card-border bg-surface-lowest p-6 shadow-card">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant md:col-span-2">
          Course Name
          <input
            required
            value={values.courseName}
            onChange={(event) => updateField('courseName', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant md:col-span-2">
          Description
          <textarea
            value={values.description}
            onChange={(event) => updateField('description', event.target.value)}
            rows={4}
            className="mt-2 w-full resize-y rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Level
          <select
            value={values.level}
            onChange={(event) => updateField('level', event.target.value as CourseLevel | '')}
            className="mt-2 w-full rounded-lg border border-input-border bg-surface-lowest px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          >
            <option value="">Select level</option>
            {courseLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Max Capacity
          <input
            type="number"
            min={1}
            value={values.maxCapacity}
            onChange={(event) => updateField('maxCapacity', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Start Date
          <input
            type="date"
            value={values.startDate}
            onChange={(event) => updateField('startDate', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          End Date
          <input
            type="date"
            value={values.endDate}
            onChange={(event) => updateField('endDate', event.target.value)}
            className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
          />
        </label>

        <label className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          <input
            type="checkbox"
            checked={values.isPaid}
            onChange={(event) => updateField('isPaid', event.target.checked)}
            className="h-4 w-4 rounded border-input-border"
          />
          Paid Course
        </label>

        {values.isPaid ? (
          <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
            Fee (USD)
            <input
              type="number"
              min={0}
              step="0.01"
              value={values.fee}
              onChange={(event) => updateField('fee', event.target.value)}
              className="mt-2 w-full rounded-lg border border-input-border px-3 py-2 text-body-sm font-normal normal-case tracking-normal text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus"
            />
          </label>
        ) : null}
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
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Course' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
