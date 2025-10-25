// React Query Hooks for Schedules

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPatientSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  toggleScheduleActive,
} from '@/lib/api/schedules';
import { ScheduleCreate, ScheduleUpdate, Schedule } from '@/types/schedule';
import { toast } from '@/hooks/use-toast';

/**
 * Get all schedules for a patient
 */
export function usePatientSchedules(patientId: string) {
  return useQuery({
    queryKey: ['patient-schedules', patientId],
    queryFn: () => getPatientSchedules(patientId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Create a new schedule
 */
export function useCreateSchedule(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ScheduleCreate) => createSchedule(patientId, data),
    onSuccess: (newSchedule: Schedule) => {
      // Invalidate and refetch schedules list
      queryClient.invalidateQueries({ queryKey: ['patient-schedules', patientId] });

      toast({
        title: 'Schedule created',
        description: `"${newSchedule.title}" has been added to the routine.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create schedule',
        description: error.response?.data?.detail || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update an existing schedule
 */
export function useUpdateSchedule(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScheduleUpdate }) => updateSchedule(id, data),
    onSuccess: (updatedSchedule: Schedule) => {
      // Invalidate schedules list
      queryClient.invalidateQueries({ queryKey: ['patient-schedules', patientId] });

      toast({
        title: 'Schedule updated',
        description: `"${updatedSchedule.title}" has been updated.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update schedule',
        description: error.response?.data?.detail || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a schedule
 */
export function useDeleteSchedule(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scheduleId: string) => deleteSchedule(scheduleId),
    onSuccess: () => {
      // Invalidate schedules list
      queryClient.invalidateQueries({ queryKey: ['patient-schedules', patientId] });

      toast({
        title: 'Schedule deleted',
        description: 'The schedule has been removed from the routine.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete schedule',
        description: error.response?.data?.detail || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Toggle schedule active status
 */
export function useToggleScheduleActive(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scheduleId, isActive }: { scheduleId: string; isActive: boolean }) =>
      toggleScheduleActive(scheduleId, isActive),
    onSuccess: () => {
      // Invalidate schedules list
      queryClient.invalidateQueries({ queryKey: ['patient-schedules', patientId] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to toggle schedule',
        description: error.response?.data?.detail || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}
