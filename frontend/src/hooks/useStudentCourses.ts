import { useQuery } from '@tanstack/react-query';
import { getStudentCourses } from '../services/api/studentDashboardApi';

export function useStudentCourses() {
  return useQuery({
    queryKey: ['studentCourses'],
    queryFn: getStudentCourses,
  });
}
