import type { CourseLevel } from '../../services/api/courseService';

const levelClasses: Record<CourseLevel, string> = {
  Beginner: 'bg-status-success-container text-status-success',
  Intermediate: 'bg-secondary-fixed text-secondary',
  Advanced: 'bg-error-container text-error',
};

interface CourseLevelBadgeProps {
  level?: CourseLevel | null;
}

export function CourseLevelBadge({ level }: CourseLevelBadgeProps) {
  if (!level) {
    return <span className="text-body-sm text-on-surface-variant">—</span>;
  }

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-[12px] font-bold ${levelClasses[level]}`}>
      {level}
    </span>
  );
}
