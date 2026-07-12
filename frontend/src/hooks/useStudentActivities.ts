import { useQuery } from '@tanstack/react-query';
import { getStudentActivities } from '../services/api/studentDashboardApi';

export function useStudentActivities(limit = 10) {
  return useQuery({
    queryKey: ['studentActivities', limit],
    queryFn: () => getStudentActivities(limit),
  });
}