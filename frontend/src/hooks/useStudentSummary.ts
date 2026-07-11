import { useQuery } from '@tanstack/react-query';
import { getStudentSummary } from '../services/api/studentDashboardApi';

export function useStudentSummary() {
  return useQuery({
    queryKey: ['studentSummary'],
    queryFn: getStudentSummary,
  });
}
