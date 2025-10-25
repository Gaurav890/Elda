// React Query Hooks for Patients

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
} from '@/lib/api/patients';
import { Patient, PatientCreate, PatientUpdate } from '@/types/patient';
import { toast } from '@/hooks/use-toast';

/**
 * Get all patients
 */
export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: getPatients,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get a specific patient by ID
 */
export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatient(id!),
    enabled: !!id, // Only fetch if ID exists
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Create a new patient
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PatientCreate) => createPatient(data),
    onSuccess: (newPatient: Patient) => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      toast({
        title: 'Patient created',
        description: `${newPatient.full_name} has been added to your care circle.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create patient',
        description: error.response?.data?.detail || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Update an existing patient
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatientUpdate }) => updatePatient(id, data),
    onSuccess: (updatedPatient: Patient) => {
      // Invalidate both the list and the specific patient
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', updatedPatient.id] });

      toast({
        title: 'Patient updated',
        description: `${updatedPatient.full_name}'s information has been updated.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update patient',
        description: error.response?.data?.detail || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}

/**
 * Delete a patient
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePatient(id),
    onSuccess: () => {
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: ['patients'] });

      toast({
        title: 'Patient removed',
        description: 'The patient has been removed from your care circle.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete patient',
        description: error.response?.data?.detail || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });
}
