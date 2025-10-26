/**
 * API Configuration
 * Backend endpoint URLs and timeouts
 */

import { Platform } from 'react-native';

// iOS Simulator needs local network IP, Android Emulator uses 10.0.2.2
// For production, use environment variable
const getBaseURL = (): string => {
  if (process.env.API_URL) {
    return process.env.API_URL;
  }

  if (__DEV__) {
    // Development mode
    if (Platform.OS === 'ios') {
      // iOS Simulator can use localhost
      // Real Device needs local network IP: 10.72.1.235
      return 'http://localhost:8000';
    } else {
      // Android Emulator - use special alias
      return 'http://10.0.2.2:8000';
    }
  }

  // Production - should be set via environment variable
  return 'https://api.eldercompanion.app';
};

export const API_CONFIG = {
  BASE_URL: getBaseURL(),
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

  // Patient data
  PATIENT_DETAIL: (patientId: string) => `/api/v1/patients/${patientId}`,
  PATIENT_SCHEDULES: (patientId: string) =>
    `/api/v1/mobile/patients/${patientId}/schedules`,
  PATIENT_REMINDERS: (patientId: string) =>
    `/api/v1/mobile/patients/${patientId}/reminders`,

  // Reminder acknowledgment
  ACKNOWLEDGE_REMINDER: (reminderId: string) =>
    `/api/v1/mobile/reminders/${reminderId}/acknowledge`,
};
