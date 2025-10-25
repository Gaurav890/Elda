/**
 * App Constants
 * Global configuration values
 */

export const APP_CONFIG = {
  APP_VERSION: '1.0.0',
  APP_NAME: 'Elder Companion',

  // Heartbeat configuration
  HEARTBEAT_INTERVAL_MINUTES: 15,

  // Voice configuration
  TTS_RATE: 0.9, // Slightly slower for elderly users
  TTS_LANGUAGE: 'en-US',
  STT_LANGUAGE: 'en-US',

  // UI configuration
  BUTTON_SIZE_LARGE: 80,
  FONT_SIZE_LARGE: 24,
  FONT_SIZE_MEDIUM: 18,
  FONT_SIZE_SMALL: 14,
};

export const STORAGE_KEYS = {
  PATIENT_ID: 'patient_id',
  DEVICE_TOKEN: 'device_token',
  PENDING_MESSAGES: 'pending_messages',
  LAST_SYNC: 'last_sync_timestamp',
  SETTINGS: 'app_settings',
};

export const ACTIVITY_TYPES = {
  HEARTBEAT: 'heartbeat',
  APP_OPEN: 'app_open',
  APP_CLOSE: 'app_close',
  EMERGENCY: 'emergency',
  CONVERSATION: 'conversation',
  REMINDER_RESPONSE: 'reminder_response',
} as const;
