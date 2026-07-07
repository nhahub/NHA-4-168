import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../services/api/dashboardApi';
import { useToast } from '../contexts/ToastContext';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Failed to load dashboard summary.';
}

export function useDashboardSummary() {
  const { toast } = useToast();
  const lastErrorRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });

  useEffect(() => {
    if (query.isError) {
      const message = getErrorMessage(query.error);
      if (lastErrorRef.current !== message) {
        toast.error(message);
        lastErrorRef.current = message;
      }
    } else {
      lastErrorRef.current = null;
    }
  }, [query.error, query.isError, toast]);

  return query;
}