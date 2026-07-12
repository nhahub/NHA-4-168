import { useQuery } from '@tanstack/react-query';
import { getInstructorActivities } from '../services/api/instructorDashboardApi';

export function useInstructorActivities(limit = 10) {
  return useQuery({
    queryKey: ['instructorActivities', limit],
    queryFn: () => getInstructorActivities(limit),
  });
}
