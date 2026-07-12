import { useQuery } from '@tanstack/react-query';
import { getDriverActivities } from '../services/api/driverDashboardApi';

export function useDriverActivities(limit = 10) {
  return useQuery({
    queryKey: ['driverActivities', limit],
    queryFn: () => getDriverActivities(limit),
  });
}
