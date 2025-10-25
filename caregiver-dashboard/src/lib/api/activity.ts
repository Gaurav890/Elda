// Activity API Client

import { apiClient } from './axios';
import {
  ActivityLogListResponse,
  DailyReminderSummary,
  AIInsightsListResponse,
  MoodData,
} from '@/types/activity';

/**
 * Get activity logs for a patient
 */
export async function getPatientActivity(
  patientId: string,
  limit: number = 20
): Promise<ActivityLogListResponse> {
  try {
    const response = await apiClient.get<ActivityLogListResponse>(
      `/patients/${patientId}/activity`,
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching patient activity:', error);
    // Return empty data if API fails
    return { activities: [], total: 0 };
  }
}

/**
 * Get today's reminder summary for a patient
 */
export async function getTodayReminderSummary(
  patientId: string
): Promise<DailyReminderSummary | null> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get<DailyReminderSummary>(
      `/schedules/patients/${patientId}/reminders`,
      { params: { date: today } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching reminder summary:', error);
    // Return mock data if API fails
    return {
      date: new Date().toISOString(),
      summary: {
        total: 0,
        completed: 0,
        missed: 0,
        pending: 0,
        completion_rate: 0,
      },
    };
  }
}

/**
 * Get AI insights for a patient
 */
export async function getPatientInsights(
  patientId: string,
  limit: number = 3
): Promise<AIInsightsListResponse> {
  try {
    const response = await apiClient.get<AIInsightsListResponse>(
      `/conversations/patients/${patientId}/insights`,
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching patient insights:', error);
    // Return empty data if API fails
    return { insights: [], total: 0 };
  }
}

/**
 * Get patient's current mood
 */
export async function getPatientMood(patientId: string): Promise<MoodData | null> {
  try {
    const response = await apiClient.get<MoodData>(`/patients/${patientId}/mood`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient mood:', error);
    return null;
  }
}

/**
 * Get weekly adherence rate for a patient
 */
export async function getWeeklyAdherence(patientId: string): Promise<{
  rate: number;
  completed: number;
  total: number;
} | null> {
  try {
    const response = await apiClient.get(`/schedules/patients/${patientId}/adherence/weekly`);
    return response.data;
  } catch (error) {
    console.error('Error fetching weekly adherence:', error);
    return null;
  }
}
