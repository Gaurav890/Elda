/**
 * Patient Store
 * Global state management for patient data using Zustand
 */

import { create } from 'zustand';
import { storageService } from '../services/storage.service';

interface PatientState {
  patientId: string | null;
  patientName: string | null;
  preferredName: string | null;
  isSetupComplete: boolean;

  // Actions
  setPatientData: (
    patientId: string,
    patientName: string,
    preferredName: string | null,
  ) => void;
  loadPatientData: () => Promise<void>;
  clearPatientData: () => Promise<void>;
}

export const usePatientStore = create<PatientState>((set, get) => ({
  patientId: null,
  patientName: null,
  preferredName: null,
  isSetupComplete: false,

  setPatientData: (patientId, patientName, preferredName) => {
    set({
      patientId,
      patientName,
      preferredName,
      isSetupComplete: true,
    });
  },

  loadPatientData: async () => {
    const patientId = await storageService.getPatientId();
    if (patientId) {
      set({
        patientId,
        isSetupComplete: true,
      });
    }
  },

  clearPatientData: async () => {
    await storageService.clearAll();
    set({
      patientId: null,
      patientName: null,
      preferredName: null,
      isSetupComplete: false,
    });
  },
}));
