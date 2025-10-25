// React Query Hooks for Activity & Patient Overview Data

import { useQuery } from '@tanstack/react-query';
import {
  getPatientActivity,
  getTodayReminderSummary,
  getPatientInsights,
  getPatientMood,
  getWeeklyAdherence,
} from '@/lib/api/activity';

/**
 * Get patient activity logs
 */
export function usePatientActivity(patientId: string, limit: number = 20) {
  return useQuery({
    queryKey: ['patient-activity', patientId, limit],
    queryFn: () => getPatientActivity(patientId, limit),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
  });
}

/**
 * Get today's reminder summary
 */
export function useTodayReminderSummary(patientId: string) {
  return useQuery({
    queryKey: ['today-reminders', patientId],
    queryFn: () => getTodayReminderSummary(patientId),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
  });
}

/**
 * Get patient AI insights
 */
export function usePatientInsights(patientId: string, limit: number = 3) {
  return useQuery({
    queryKey: ['patient-insights', patientId, limit],
    queryFn: () => getPatientInsights(patientId, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
  });
}

/**
 * Get patient's current mood
 */
export function usePatientMood(patientId: string) {
  return useQuery({
    queryKey: ['patient-mood', patientId],
    queryFn: () => getPatientMood(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
  });
}

/**
 * Get weekly adherence rate
 */
export function useWeeklyAdherence(patientId: string) {
  return useQuery({
    queryKey: ['weekly-adherence', patientId],
    queryFn: () => getWeeklyAdherence(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Auto-refresh every 60 seconds
  });
}
