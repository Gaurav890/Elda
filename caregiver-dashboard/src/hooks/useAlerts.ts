import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatientAlerts, acknowledgeAlert } from '@/lib/api/alerts';
import type { Alert } from '@/types/alert';

// Query key factory
export const alertKeys = {
  all: ['alerts'] as const,
  lists: () => [...alertKeys.all, 'list'] as const,
  list: (patientId: string) => [...alertKeys.lists(), patientId] as const,
  detail: (alertId: string) => [...alertKeys.all, 'detail', alertId] as const,
};

// Hook to fetch patient alerts
export function usePatientAlerts(patientId: string) {
  return useQuery({
    queryKey: alertKeys.list(patientId),
    queryFn: () => getPatientAlerts(patientId),
    enabled: !!patientId,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for new alerts
  });
}

// Hook to acknowledge an alert
export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: (updatedAlert: Alert) => {
      // Invalidate and refetch patient alerts
      queryClient.invalidateQueries({
        queryKey: alertKeys.list(updatedAlert.patient_id),
      });
    },
    onError: (error) => {
      console.error('Failed to acknowledge alert:', error);
    },
  });
}
