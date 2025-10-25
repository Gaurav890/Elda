// Schedule API Client

import { apiClient } from './axios';
import {
  Schedule,
  ScheduleCreate,
  ScheduleUpdate,
  ScheduleListResponse,
} from '@/types/schedule';

/**
 * Get all schedules for a patient
 */
export async function getPatientSchedules(patientId: string): Promise<ScheduleListResponse> {
  try {
    const response = await apiClient.get<ScheduleListResponse>(
      `/schedules/patients/${patientId}/schedules`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching patient schedules:', error);
    // Return empty data if API fails
    return { schedules: [], total: 0 };
  }
}

/**
 * Get a specific schedule by ID
 */
export async function getSchedule(scheduleId: string): Promise<Schedule | null> {
  try {
    const response = await apiClient.get<Schedule>(`/schedules/schedules/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return null;
  }
}

/**
 * Create a new schedule for a patient
 */
export async function createSchedule(
  patientId: string,
  data: ScheduleCreate
): Promise<Schedule> {
  const response = await apiClient.post<Schedule>(
    `/schedules/patients/${patientId}/schedules`,
    data
  );
  return response.data;
}

/**
 * Update an existing schedule
 */
export async function updateSchedule(
  scheduleId: string,
  data: ScheduleUpdate
): Promise<Schedule> {
  const response = await apiClient.patch<Schedule>(`/schedules/schedules/${scheduleId}`, data);
  return response.data;
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  await apiClient.delete(`/schedules/schedules/${scheduleId}`);
}

/**
 * Toggle schedule active status
 */
export async function toggleScheduleActive(
  scheduleId: string,
  isActive: boolean
): Promise<Schedule> {
  return updateSchedule(scheduleId, { is_active: isActive });
}
