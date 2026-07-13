import { useQuery } from '@tanstack/react-query';
import { getInstructorPayments } from '../services/api/instructorDashboardApi';

export function useInstructorPayments() {
  return useQuery({
    queryKey: ['instructorPayments'],
    queryFn: getInstructorPayments,
  });
}