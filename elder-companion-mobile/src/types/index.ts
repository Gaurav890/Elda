/**
 * TypeScript type definitions
 */

// API Types
export interface MobileSetupRequest {
  patient_id: string;
  setup_token: string;
}

export interface MobileSetupResponse {
  success: boolean;
  patient_id: string;
  patient_name: string;
  preferred_name: string | null;
}

export interface DeviceTokenRequest {
  patient_id: string;
  device_token: string;
  platform: 'ios' | 'android';
  app_version?: string;
}

export interface DeviceTokenResponse {
  success: boolean;
  message: string;
}

export interface VoiceInteractRequest {
  patient_id: string;
  message: string;
  conversation_type: 'spontaneous' | 'reminder_response' | 'check_in' | 'emergency';
  context?: {
    app_state?: string;
    battery_level?: number;
    [key: string]: any;
  };
}

export interface VoiceInteractResponse {
  ai_response: string;
  conversation_id: string;
  sentiment: string;
  urgency_level: string;
  alert_created: boolean;
  continue_conversation: boolean;
}

export interface HeartbeatRequest {
  activity_type: string;
  device_type: string;
  app_version: string;
  latitude?: number;
  longitude?: number;
  battery_level?: number;
  details?: Record<string, any>;
}

export interface HeartbeatResponse {
  success: boolean;
  pending_actions?: any[];
}

// App State Types
export interface AppSettings {
  volume: number;
  ttsRate: number;
  language: string;
}

export interface PendingMessage {
  id: string;
  patientId: string;
  message: string;
  timestamp: string;
  retryCount: number;
}

// Navigation Types
export type RootStackParamList = {
  Setup: undefined;
  Home: undefined;
  VoiceChat: { reminderId?: string };
  Settings: undefined;
};
