// React Query Hooks for Conversations

import { useQuery } from '@tanstack/react-query';
import { getPatientConversations, getConversationCount } from '@/lib/api/conversations';
import { ConversationFilters } from '@/types/conversation';

/**
 * Get patient conversations with optional filters
 */
export function usePatientConversations(
  patientId: string,
  filters?: ConversationFilters,
  limit: number = 100
) {
  return useQuery({
    queryKey: ['patient-conversations', patientId, filters, limit],
    queryFn: () => getPatientConversations(patientId, filters, limit),
    staleTime: 60 * 1000, // 1 minute
    enabled: !!patientId, // Only fetch if patientId exists
  });
}

/**
 * Get conversation count for a patient
 */
export function useConversationCount(patientId: string) {
  return useQuery({
    queryKey: ['conversation-count', patientId],
    queryFn: () => getConversationCount(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!patientId,
  });
}
