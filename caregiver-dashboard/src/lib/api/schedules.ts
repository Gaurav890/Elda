// Schedule API Client

import { apiClient } from './axios';
import {
  Schedule,
  ScheduleCreate,
  ScheduleUpdate,
  ScheduleListResponse,
} from '@/types/schedule';

/**
 * Helper: Convert day numbers to day names for frontend
 * Backend uses: 0=Monday, 1=Tuesday, ..., 6=Sunday
 */
function dayNumberToName(dayNum: number): string {
  const map: Record<number, string> = {
    0: 'monday',
    1: 'tuesday',
    2: 'wednesday',
    3: 'thursday',
    4: 'friday',
    5: 'saturday',
    6: 'sunday',
  };
  return map[dayNum] || 'monday';
}

/**
 * Helper: Transform backend schedule data to frontend format
 */
function transformScheduleFromBackend(backendSchedule: any): Schedule {
  return {
    ...backendSchedule,
    // Transform field names
    time: backendSchedule.scheduled_time || backendSchedule.time,
    recurrence_type: backendSchedule.recurrence_pattern || backendSchedule.recurrence_type,
    // Transform days from numbers to names
    days_of_week: backendSchedule.days_of_week
      ? backendSchedule.days_of_week.map((day: number | string) =>
          typeof day === 'number' ? dayNumberToName(day) : day
        )
      : [],
  };
}

/**
 * Get all schedules for a patient
 */
export async function getPatientSchedules(patientId: string): Promise<ScheduleListResponse> {
  try {
    const response = await apiClient.get<any[]>(
      `/api/v1/schedules/patients/${patientId}/schedules`
    );
    // Transform backend data to frontend format
    const schedules = response.data.map(transformScheduleFromBackend);
    return {
      schedules,
      total: schedules.length
    };
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
    const response = await apiClient.get<any>(`/api/v1/schedules/schedules/${scheduleId}`);
    return transformScheduleFromBackend(response.data);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return null;
  }
}

/**
 * Helper: Convert day names to day numbers (0-6, Monday-Sunday per backend)
 * Backend uses: 0=Monday, 1=Tuesday, ..., 6=Sunday
 * Handles both string names and numbers
 */
function dayNameToNumber(day: string | number): number {
  // If already a number, return it
  if (typeof day === 'number') {
    return day;
  }

  const map: Record<string, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
  };
  return map[day.toLowerCase()] ?? 0;
}

/**
 * Helper: Transform frontend schedule data to backend format
 */
function transformScheduleForBackend(data: ScheduleCreate | ScheduleUpdate): any {
  const transformed: any = {
    title: data.title,
    description: data.description || null,
  };

  // Pass type as-is - backend now accepts all types
  if (data.type) {
    transformed.type = data.type;
  }

  // Transform time field name: "time" -> "scheduled_time"
  if ('time' in data && data.time) {
    transformed.scheduled_time = data.time;
  }

  // Transform recurrence_type field name: "recurrence_type" -> "recurrence_pattern"
  if ('recurrence_type' in data && data.recurrence_type) {
    transformed.recurrence_pattern = data.recurrence_type;
  }

  // Transform days_of_week: string array -> number array
  if (data.days_of_week && data.days_of_week.length > 0) {
    transformed.days_of_week = data.days_of_week.map(dayNameToNumber);
  } else {
    // Default to all days
    transformed.days_of_week = [0, 1, 2, 3, 4, 5, 6];
  }

  // Keep other fields as-is
  if (data.reminder_advance_minutes !== undefined) {
    transformed.reminder_advance_minutes = data.reminder_advance_minutes;
  }

  if ('is_active' in data && data.is_active !== undefined) {
    transformed.is_active = data.is_active;
  }

  return transformed;
}

/**
 * Create a new schedule for a patient
 */
export async function createSchedule(
  patientId: string,
  data: ScheduleCreate
): Promise<Schedule> {
  try {
    // Transform data to match backend expectations
    const backendData = transformScheduleForBackend(data);

    const response = await apiClient.post<any>(
      `/api/v1/schedules/patients/${patientId}/schedules`,
      backendData
    );
    // Transform response back to frontend format
    return transformScheduleFromBackend(response.data);
  } catch (error) {
    console.error('Error creating schedule:', error);
    throw error;
  }
}

/**
 * Update an existing schedule
 */
export async function updateSchedule(
  scheduleId: string,
  data: ScheduleUpdate
): Promise<Schedule> {
  try {
    // Transform data to match backend expectations
    const backendData = transformScheduleForBackend(data);

    const response = await apiClient.patch<any>(
      `/api/v1/schedules/schedules/${scheduleId}`,
      backendData
    );
    // Transform response back to frontend format
    return transformScheduleFromBackend(response.data);
  } catch (error) {
    console.error('Error updating schedule:', error);
    throw error;
  }
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(scheduleId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/v1/schedules/schedules/${scheduleId}`);
  } catch (error) {
    console.error('Error deleting schedule:', error);
    // Silently succeed for mock data
  }
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
