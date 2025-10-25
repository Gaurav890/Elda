// Authentication Types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  caregiver: Caregiver;
}

export interface Caregiver {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  profile_photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CaregiverPreferences {
  notifications_email: boolean;
  notifications_sms: boolean;
  notifications_push: boolean;
  alert_threshold: 'low' | 'medium' | 'high' | 'critical';
  quiet_hours_enabled: boolean;
  quiet_hours_start?: string; // HH:mm format
  quiet_hours_end?: string; // HH:mm format
  daily_summary_time?: string; // HH:mm format
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
