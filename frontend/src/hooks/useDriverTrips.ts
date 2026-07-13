import { useQuery } from '@tanstack/react-query';
import { getDriverTrips } from '../services/api/driverDashboardApi';
import type { TripDto } from '../services/api/tripService';

export function useDriverTrips() {
  return useQuery({
    queryKey: ['driverTrips'],
    queryFn: getDriverTrips,
    select: (trips: TripDto[]) => trips.map((trip) => ({ ...trip, status: trip.status })),
  });
}
