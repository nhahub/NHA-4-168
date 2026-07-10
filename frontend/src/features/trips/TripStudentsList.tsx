import { UserMinus, UserPlus } from 'lucide-react';
import { useState } from 'react';
import type { TripStudentDto } from '../../services/api/tripService';

interface TripStudentsListProps {
  students: TripStudentDto[];
  maxSeats: number;
  isBusy?: boolean;
  canManageStudents?: boolean;
  onAddStudent: (studentSsn: number) => Promise<void>;
  onRemoveStudent: (studentSsn: number) => Promise<void>;
}

export function TripStudentsList({ students, maxSeats, isBusy, canManageStudents = true, onAddStudent, onRemoveStudent }: TripStudentsListProps) {
  const [newStudentSsn, setNewStudentSsn] = useState('');
  const isFull = students.length >= maxSeats;

  const handleAdd = async () => {
    const ssn = Number(newStudentSsn);
    if (!ssn || isFull) return;
    await onAddStudent(ssn);
    setNewStudentSsn('');
  };

  return (
    <div className="rounded-xl border border-card-border bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-outline-variant p-4">
        <h2 className="text-title-sm text-on-background">Students</h2>
        <span className="text-body-sm text-on-surface-variant">
          {students.length} / {maxSeats} seats
        </span>
      </div>

      {students.length === 0 ? (
        <p className="p-6 text-body-sm text-on-surface-variant">No students assigned to this trip yet.</p>
      ) : (
        <ul className="divide-y divide-outline-variant/60">
          {students.map((student) => (
            <li key={student.studentSsn} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-body-sm font-semibold text-on-surface">{student.studentName}</p>
                <p className="text-body-sm text-on-surface-variant">SSN: {student.studentSsn}</p>
              </div>
              {canManageStudents ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onRemoveStudent(student.studentSsn)}
                  className="rounded-full p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-error disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={`Remove ${student.studentName}`}
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {canManageStudents ? (
        <div className="flex items-center gap-2 border-t border-outline-variant p-4">
          <input
            value={newStudentSsn}
            onChange={(event) => setNewStudentSsn(event.target.value)}
            disabled={isFull || isBusy}
            placeholder={isFull ? 'Trip is full' : 'Student SSN'}
            type="number"
            className="w-full rounded-lg border border-input-border px-3 py-2 text-body-sm text-on-surface outline-none focus:border-input-border-focus focus:shadow-focus disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            disabled={isFull || isBusy || !newStudentSsn}
            onClick={handleAdd}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-body-sm font-semibold text-on-secondary hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus className="h-4 w-4" />
            Add
          </button>
        </div>
      ) : null}
    </div>
  );
}
