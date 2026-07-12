import { useQuery } from '@tanstack/react-query';
import { getInstructorSummary } from '../services/api/instructorDashboardApi';

export function useInstructorSummary() {
  return useQuery({
    queryKey: ['instructorSummary'],
    queryFn: getInstructorSummary,
  });
}
