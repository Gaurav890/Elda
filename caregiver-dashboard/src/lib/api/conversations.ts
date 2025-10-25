// Conversations API Client

import { apiClient } from './axios';
import { Conversation, ConversationFilters } from '@/types/conversation';

export interface ConversationListResponse {
  conversations: Conversation[];
  total: number;
}

// Backend response format (each record has both patient and AI messages)
interface BackendConversation {
  id: string;
  patient_id: string;
  patient_message: string;
  ai_response: string;
  conversation_type: string;
  sentiment: string | null;
  health_mentions: string[];
  urgency_level: string;
  created_at: string;
}

/**
 * Get conversations for a patient
 * @param patientId - Patient ID
 * @param filters - Filter options (days)
 * @param limit - Maximum number of conversations to return
 */
export async function getPatientConversations(
  patientId: string,
  filters?: ConversationFilters,
  limit: number = 100
): Promise<ConversationListResponse> {
  try {
    const params: Record<string, any> = { limit };

    // Calculate date filter if days specified
    if (filters?.days !== undefined) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - filters.days);
      params.start_date = startDate.toISOString().split('T')[0];
    }

    const response = await apiClient.get<BackendConversation[]>(
      `/api/v1/conversations/patients/${patientId}/conversations`,
      { params }
    );

    // Transform backend response: flatten each conversation into 2 messages (patient + AI)
    const conversations: Conversation[] = [];
    response.data.forEach((conv, index) => {
      // Patient message
      conversations.push({
        id: parseInt(conv.id.replace(/-/g, '').substring(0, 8), 16), // Convert UUID to number
        patient_id: parseInt(patientId),
        sender: 'patient',
        message: conv.patient_message,
        timestamp: conv.created_at,
        sentiment: conv.sentiment as any,
        urgency: conv.urgency_level as any,
        health_mentions: conv.health_mentions,
        created_at: conv.created_at,
      });

      // AI response (comes after patient message)
      conversations.push({
        id: parseInt(conv.id.replace(/-/g, '').substring(0, 8), 16) + 0.5, // Unique ID
        patient_id: parseInt(patientId),
        sender: 'ai',
        message: conv.ai_response,
        timestamp: conv.created_at,
        created_at: conv.created_at,
      });
    });

    return { conversations, total: conversations.length };
  } catch (error) {
    console.error('Error fetching patient conversations:', error);
    // Return empty data if API fails
    return { conversations: [], total: 0 };
  }
}

/**
 * Get conversation count for a patient
 */
export async function getConversationCount(patientId: string): Promise<number> {
  try {
    const response = await apiClient.get<{ count: number }>(
      `/api/v1/conversations/patients/${patientId}/conversations/count`
    );
    return response.data.count;
  } catch (error) {
    console.error('Error fetching conversation count:', error);
    return 0;
  }
}
