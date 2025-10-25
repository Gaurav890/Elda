import { apiClient } from './axios';
import type {
  PatientReports,
  TimeRange,
  MedicationAdherenceData,
  ActivityData,
  MoodData,
  HealthMetric,
  ReportSummary,
} from '@/types/report';

/**
 * Get patient reports data
 */
export async function getPatientReports(
  patientId: string,
  timeRange: TimeRange = '30d'
): Promise<PatientReports> {
  try {
    const response = await apiClient.get<PatientReports>(
      `/patients/${patientId}/reports`,
      { params: { range: timeRange } }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    // Return mock data until backend is ready
    return getMockReports(patientId, timeRange);
  }
}

// Mock data generator
function getMockReports(patientId: string, timeRange: TimeRange): PatientReports {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
  const now = new Date();

  // Generate medication adherence data
  const medication_adherence: MedicationAdherenceData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const scheduled = 5;
    const taken = Math.floor(3 + Math.random() * 3); // 3-5 taken
    medication_adherence.push({
      date: date.toISOString().split('T')[0],
      adherence: Math.round((taken / scheduled) * 100),
      taken,
      scheduled,
    });
  }

  // Generate activity data
  const activity: ActivityData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const minutes = Math.floor(10 + Math.random() * (isWeekend ? 40 : 60));
    activity.push({
      date: date.toISOString().split('T')[0],
      minutes,
      type: 'walk',
      calories: Math.floor(minutes * 3.5),
    });
  }

  // Generate mood data
  const mood: MoodData[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const score = Math.floor(5 + Math.random() * 5); // 5-10
    const sentiment: 'positive' | 'neutral' | 'negative' =
      score >= 7 ? 'positive' : score >= 5 ? 'neutral' : 'negative';
    mood.push({
      date: date.toISOString().split('T')[0],
      score,
      sentiment,
    });
  }

  // Generate health metrics (blood pressure)
  const health_metrics: HealthMetric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    if (i % 2 === 0) {
      // Every other day
      health_metrics.push({
        date: date.toISOString().split('T')[0],
        value: 120, // systolic
        unit: 'mmHg',
        type: 'blood_pressure',
        systolic: 115 + Math.floor(Math.random() * 15),
        diastolic: 70 + Math.floor(Math.random() * 15),
      });
    }
  }

  // Calculate summary
  const recentDays = 7;
  const recentMedication = medication_adherence.slice(-recentDays);
  const recentActivity = activity.slice(-recentDays);
  const recentMood = mood.slice(-recentDays);

  const avgMedication =
    recentMedication.reduce((sum, d) => sum + d.adherence, 0) / recentMedication.length;
  const avgActivity =
    recentActivity.reduce((sum, d) => sum + d.minutes, 0) / recentActivity.length;
  const avgMood = recentMood.reduce((sum, d) => sum + d.score, 0) / recentMood.length;

  // Calculate trends (compare last 7 days to previous 7 days)
  const prevMedication = medication_adherence.slice(-14, -7);
  const prevActivity = activity.slice(-14, -7);
  const prevMood = mood.slice(-14, -7);

  const prevAvgMedication =
    prevMedication.length > 0
      ? prevMedication.reduce((sum, d) => sum + d.adherence, 0) / prevMedication.length
      : avgMedication;
  const prevAvgActivity =
    prevActivity.length > 0
      ? prevActivity.reduce((sum, d) => sum + d.minutes, 0) / prevActivity.length
      : avgActivity;
  const prevAvgMood =
    prevMood.length > 0
      ? prevMood.reduce((sum, d) => sum + d.score, 0) / prevMood.length
      : avgMood;

  const summary: ReportSummary = {
    medication_adherence: {
      average: Math.round(avgMedication),
      trend:
        avgMedication > prevAvgMedication + 5
          ? 'up'
          : avgMedication < prevAvgMedication - 5
          ? 'down'
          : 'stable',
      last_week: Math.round(avgMedication),
    },
    activity_level: {
      average_minutes: Math.round(avgActivity),
      trend:
        avgActivity > prevAvgActivity + 10
          ? 'up'
          : avgActivity < prevAvgActivity - 10
          ? 'down'
          : 'stable',
      last_week: Math.round(avgActivity),
    },
    mood: {
      average_score: Math.round(avgMood * 10) / 10,
      trend:
        avgMood > prevAvgMood + 1 ? 'up' : avgMood < prevAvgMood - 1 ? 'down' : 'stable',
      last_week: Math.round(avgMood * 10) / 10,
    },
  };

  return {
    medication_adherence,
    activity,
    mood,
    health_metrics,
    summary,
  };
}
