import { useQuery } from '@tanstack/react-query';
import { getDriverSummary } from '../services/api/driverDashboardApi';

export function useDriverSummary() {
  return useQuery({
    queryKey: ['driverSummary'],
    queryFn: getDriverSummary,
  });
}
