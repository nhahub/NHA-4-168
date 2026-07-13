import { useQuery } from '@tanstack/react-query';
import { getInstructorCourses } from '../services/api/instructorDashboardApi';

export function useInstructorCourses() {
  return useQuery({
    queryKey: ['instructorCourses'],
    queryFn: getInstructorCourses,
  });
}
