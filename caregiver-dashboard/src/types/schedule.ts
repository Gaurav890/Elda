// Schedule Types

export type ScheduleType = 'medication' | 'meal' | 'exercise' | 'appointment' | 'other';

export type RecurrenceType = 'daily' | 'weekly' | 'custom';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Schedule {
  id: string;
  patient_id: string;
  title: string;
  description?: string;
  schedule_type: ScheduleType;
  time: string; // HH:MM format (24-hour)
  recurrence_type: RecurrenceType;
  days_of_week?: DayOfWeek[]; // For weekly recurrence
  reminder_advance_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduleCreate {
  title: string;
  description?: string;
  schedule_type: ScheduleType;
  time: string;
  recurrence_type: RecurrenceType;
  days_of_week?: DayOfWeek[];
  reminder_advance_minutes?: number;
  is_active?: boolean;
}

export interface ScheduleUpdate {
  title?: string;
  description?: string;
  schedule_type?: ScheduleType;
  time?: string;
  recurrence_type?: RecurrenceType;
  days_of_week?: DayOfWeek[];
  reminder_advance_minutes?: number;
  is_active?: boolean;
}

export interface ScheduleListResponse {
  schedules: Schedule[];
  total: number;
}
