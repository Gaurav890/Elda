// Report types and interfaces

export interface MedicationAdherenceData {
  date: string;
  adherence: number; // percentage 0-100
  taken: number;
  scheduled: number;
}

export interface ActivityData {
  date: string;
  minutes: number;
  type: string;
  calories?: number;
}

export interface MoodData {
  date: string;
  score: number; // 1-10
  sentiment: 'positive' | 'neutral' | 'negative';
  notes?: string;
}

export interface HealthMetric {
  date: string;
  value: number;
  unit: string;
  type: 'blood_pressure' | 'heart_rate' | 'weight' | 'temperature' | 'blood_sugar';
  systolic?: number; // for blood pressure
  diastolic?: number; // for blood pressure
}

export interface ReportSummary {
  medication_adherence: {
    average: number;
    trend: 'up' | 'down' | 'stable';
    last_week: number;
  };
  activity_level: {
    average_minutes: number;
    trend: 'up' | 'down' | 'stable';
    last_week: number;
  };
  mood: {
    average_score: number;
    trend: 'up' | 'down' | 'stable';
    last_week: number;
  };
}

export interface PatientReports {
  medication_adherence: MedicationAdherenceData[];
  activity: ActivityData[];
  mood: MoodData[];
  health_metrics: HealthMetric[];
  summary: ReportSummary;
}

export type TimeRange = '7d' | '30d' | '90d' | 'all';
