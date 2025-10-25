// Patient API Functions

import apiClient from './axios';
import { Patient, PatientCreate, PatientUpdate } from '@/types/patient';

/**
 * Get all patients for the current caregiver
 */
export async function getPatients(): Promise<Patient[]> {
  const response = await apiClient.get<Patient[]>('/api/v1/patients');
  return response.data;
}

/**
 * Get a specific patient by ID
 */
export async function getPatient(id: string): Promise<Patient> {
  const response = await apiClient.get<Patient>(`/api/v1/patients/${id}`);
  return response.data;
}

/**
 * Create a new patient
 */
export async function createPatient(data: PatientCreate): Promise<Patient> {
  const response = await apiClient.post<Patient>('/api/v1/patients', data);
  return response.data;
}

/**
 * Update an existing patient
 */
export async function updatePatient(id: string, data: PatientUpdate): Promise<Patient> {
  const response = await apiClient.patch<Patient>(`/api/v1/patients/${id}`, data);
  return response.data;
}

/**
 * Delete a patient
 */
export async function deletePatient(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/patients/${id}`);
}

/**
 * Assign a caregiver to a patient
 */
export async function assignCaregiver(patientId: string, caregiverId: string): Promise<void> {
  await apiClient.post(`/api/v1/patients/${patientId}/caregivers/${caregiverId}`);
}

/**
 * Remove a caregiver from a patient
 */
export async function removeCaregiver(patientId: string, caregiverId: string): Promise<void> {
  await apiClient.delete(`/api/v1/patients/${patientId}/caregivers/${caregiverId}`);
}
