// Alert types and enums
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AlertType {
  MEDICATION = 'medication',
  HEALTH = 'health',
  ACTIVITY = 'activity',
  SAFETY = 'safety',
  MOOD = 'mood',
  OTHER = 'other',
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
}

export interface Alert {
  id: string;
  patient_id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  recommended_action?: string;
  created_at: string;
  acknowledged_at?: string;
  acknowledged_by?: string;
  metadata?: Record<string, any>;
}

export interface AlertFilters {
  severity?: AlertSeverity | 'all';
  status?: AlertStatus | 'all';
}
