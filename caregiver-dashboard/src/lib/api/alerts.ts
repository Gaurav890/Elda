import { apiClient } from './axios';
import type { Alert } from '@/types/alert';
import { AlertSeverity, AlertType, AlertStatus } from '@/types/alert';

// API response types
interface GetAlertsResponse {
  alerts: Alert[];
  total: number;
}

// In-memory cache for acknowledged alerts (until backend is ready)
const acknowledgedAlerts = new Set<string>();

// Get all alerts for a patient
export async function getPatientAlerts(patientId: string): Promise<Alert[]> {
  try {
    const response = await apiClient.get<GetAlertsResponse>(
      `/conversations/patients/${patientId}/alerts`
    );
    return response.data.alerts || [];
  } catch (error) {
    console.error('Error fetching patient alerts:', error);
    // Return mock data for now until backend endpoint is ready
    const alerts = getMockAlerts(patientId);
    // Apply acknowledged status from in-memory cache
    return alerts.map((alert) => {
      if (acknowledgedAlerts.has(alert.id)) {
        return {
          ...alert,
          status: AlertStatus.ACKNOWLEDGED,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: 'test@example.com',
        };
      }
      return alert;
    });
  }
}

// Acknowledge an alert
export async function acknowledgeAlert(alertId: string): Promise<Alert> {
  try {
    const response = await apiClient.patch<Alert>(
      `/conversations/alerts/${alertId}/acknowledge`
    );
    return response.data;
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    // Add to acknowledged cache for mock data
    acknowledgedAlerts.add(alertId);

    // Return mock acknowledged alert until backend is ready
    // Find the alert in our mock data and return it as acknowledged
    const mockAlerts = getMockAlerts('');
    const alert = mockAlerts.find((a) => a.id === alertId);

    if (alert) {
      return {
        ...alert,
        status: AlertStatus.ACKNOWLEDGED,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: 'test@example.com',
      };
    }

    // If alert not found, return a generic acknowledged alert
    return {
      id: alertId,
      patient_id: 'unknown',
      type: AlertType.OTHER,
      severity: AlertSeverity.LOW,
      status: AlertStatus.ACKNOWLEDGED,
      title: 'Acknowledged Alert',
      description: 'This alert has been acknowledged.',
      created_at: new Date().toISOString(),
      acknowledged_at: new Date().toISOString(),
      acknowledged_by: 'test@example.com',
    };
  }
}

// Mock data generator
function getMockAlerts(patientId: string): Alert[] {
  const now = new Date();
  const hoursAgo = (hours: number) =>
    new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();

  return [
    {
      id: '1',
      patient_id: patientId,
      type: AlertType.MEDICATION,
      severity: AlertSeverity.CRITICAL,
      status: AlertStatus.ACTIVE,
      title: 'Missed Critical Medication',
      description:
        'Patient missed blood pressure medication (Lisinopril 10mg) scheduled for 8:00 AM. This medication is critical for managing hypertension.',
      recommended_action:
        'Contact patient immediately to confirm medication was taken. If not, remind them to take it now and monitor for any symptoms.',
      created_at: hoursAgo(2),
      metadata: {
        medication_name: 'Lisinopril',
        dosage: '10mg',
        scheduled_time: '08:00',
      },
    },
    {
      id: '2',
      patient_id: patientId,
      type: AlertType.HEALTH,
      severity: AlertSeverity.HIGH,
      status: AlertStatus.ACTIVE,
      title: 'Elevated Heart Rate Detected',
      description:
        'Patient reported feeling dizzy. AI detected elevated heart rate (105 bpm) during conversation. Patient mentioned chest discomfort.',
      recommended_action:
        'Call patient to assess symptoms. Consider recommending they contact their doctor or seek medical attention if symptoms persist.',
      created_at: hoursAgo(5),
      metadata: {
        heart_rate: 105,
        symptoms: ['dizzy', 'chest discomfort'],
      },
    },
    {
      id: '3',
      patient_id: patientId,
      type: AlertType.MOOD,
      severity: AlertSeverity.MEDIUM,
      status: AlertStatus.ACTIVE,
      title: 'Negative Mood Pattern Detected',
      description:
        'Patient has expressed sadness or frustration in 4 out of last 5 conversations over the past 3 days. This is a significant change from their usual mood.',
      recommended_action:
        'Reach out to check in on their emotional well-being. Consider scheduling a video call or in-person visit.',
      created_at: hoursAgo(8),
      metadata: {
        mood_score: 3.2,
        conversation_count: 5,
        days: 3,
      },
    },
    {
      id: '4',
      patient_id: patientId,
      type: AlertType.ACTIVITY,
      severity: AlertSeverity.MEDIUM,
      status: AlertStatus.ACKNOWLEDGED,
      title: 'Reduced Physical Activity',
      description:
        'Patient has not completed daily walk for 3 consecutive days. Usual pattern is daily 20-minute walks.',
      recommended_action:
        'Encourage patient to resume light physical activity. Offer to schedule virtual walk together or suggest indoor alternatives if weather is poor.',
      created_at: hoursAgo(24),
      acknowledged_at: hoursAgo(12),
      acknowledged_by: 'test@example.com',
      metadata: {
        days_missed: 3,
        usual_activity: 'daily walk',
      },
    },
    {
      id: '5',
      patient_id: patientId,
      type: AlertType.SAFETY,
      severity: AlertSeverity.LOW,
      status: AlertStatus.ACTIVE,
      title: 'Unusual Night Activity',
      description:
        'Patient was active at 2:30 AM last night. This is outside their normal sleep pattern (typically asleep 10 PM - 7 AM).',
      recommended_action:
        'Ask patient about their sleep quality during next check-in. May indicate insomnia or other sleep disturbances.',
      created_at: hoursAgo(10),
      metadata: {
        activity_time: '02:30',
        usual_sleep: '22:00-07:00',
      },
    },
    {
      id: '6',
      patient_id: patientId,
      type: AlertType.HEALTH,
      severity: AlertSeverity.LOW,
      status: AlertStatus.ACKNOWLEDGED,
      title: 'Minor Digestive Complaint',
      description:
        'Patient mentioned mild stomach discomfort during morning check-in. No other symptoms reported.',
      recommended_action:
        'Monitor for any worsening symptoms. Remind patient to stay hydrated and avoid heavy meals.',
      created_at: hoursAgo(30),
      acknowledged_at: hoursAgo(28),
      acknowledged_by: 'test@example.com',
      metadata: {
        symptom: 'stomach discomfort',
        severity: 'mild',
      },
    },
  ];
}
