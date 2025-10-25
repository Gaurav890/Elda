import { useQuery } from '@tanstack/react-query';
import { getPatientReports } from '@/lib/api/reports';
import type { TimeRange } from '@/types/report';

// Query key factory
export const reportKeys = {
  all: ['reports'] as const,
  lists: () => [...reportKeys.all, 'list'] as const,
  list: (patientId: string, timeRange: TimeRange) =>
    [...reportKeys.lists(), patientId, timeRange] as const,
};

// Hook to fetch patient reports
export function usePatientReports(patientId: string, timeRange: TimeRange = '30d') {
  return useQuery({
    queryKey: reportKeys.list(patientId, timeRange),
    queryFn: () => getPatientReports(patientId, timeRange),
    enabled: !!patientId,
    staleTime: 300000, // 5 minutes
  });
}
