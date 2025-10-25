// Activity Log Types

export type ActivityType =
  | 'heartbeat'
  | 'conversation'
  | 'reminder_response'
  | 'reminder_sent'
  | 'app_open'
  | 'app_close'
  | 'location_update'
  | 'emergency'
  | 'schedule_completed'
  | 'schedule_missed'
  | 'other';

export interface ActivityLog {
  id: string;
  patient_id: string;
  activity_type: ActivityType;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  created_at: string;
}

export interface ActivityLogListResponse {
  activities: ActivityLog[];
  total: number;
}

// Reminder/Schedule Summary Types
export interface ReminderSummary {
  total: number;
  completed: number;
  missed: number;
  pending: number;
  completion_rate: number; // percentage
}

export interface DailyReminderSummary {
  date: string;
  summary: ReminderSummary;
}

// AI Insights Types
export interface AIInsight {
  id: string;
  patient_id: string;
  title: string;
  description: string;
  confidence_score: number; // 0-100
  insight_type: 'behavioral' | 'health' | 'social' | 'mood' | 'adherence' | 'other';
  source: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface AIInsightsListResponse {
  insights: AIInsight[];
  total: number;
}

// Mood Types
export type MoodSentiment = 'positive' | 'neutral' | 'negative';

export interface MoodData {
  sentiment: MoodSentiment;
  confidence: number;
  last_updated: string;
}
