/**
 * API Configuration
 * Backend endpoint URLs and timeouts
 */

export const API_CONFIG = {
  BASE_URL: process.env.API_URL || 'http://localhost:8000',
  TIMEOUT: parseInt(process.env.API_TIMEOUT || '10000', 10),
  VERSION: 'v1',
};

export const API_ENDPOINTS = {
  // Mobile setup
  MOBILE_SETUP: '/api/v1/mobile/setup',
  DEVICE_TOKEN: '/api/v1/mobile/device-token',

  // Voice interaction
  VOICE_INTERACT: '/api/v1/voice/interact',
  VOICE_INITIALIZE: '/api/v1/voice/initialize-agent',

  // Activity tracking
  PATIENT_HEARTBEAT: (patientId: string) =>
    `/api/v1/patients/${patientId}/heartbeat`,

  // Patient data (optional)
  PATIENT_DETAIL: (patientId: string) => `/api/v1/patients/${patientId}`,
  PATIENT_REMINDERS: (patientId: string) =>
    `/api/v1/schedules/patients/${patientId}/reminders`,
};
