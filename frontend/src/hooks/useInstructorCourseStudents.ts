import { useQuery } from '@tanstack/react-query';
import { getInstructorCourseStudents } from '../services/api/instructorDashboardApi';

export function useInstructorCourseStudents(courseId: number | null) {
  return useQuery({
    queryKey: ['instructorCourseStudents', courseId],
    queryFn: () => getInstructorCourseStudents(courseId as number),
    enabled: courseId !== null,
  });
}