// Patient Types

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  age: number;
  display_name: string;
  full_name: string;

  // Demographics
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone_number?: string;
  address?: string;

  // Emergency Contacts
  emergency_contact_name?: string;
  emergency_contact_phone?: string;

  // Medical Information
  medical_conditions: string[];
  medications: string[];
  allergies: string[];
  dietary_restrictions: string[];

  // Personalization
  profile_photo_url?: string;
  timezone: string;
  preferred_voice: 'male' | 'female' | 'neutral';
  communication_style: 'friendly' | 'formal' | 'casual';
  language: string;

  // AI Integration
  letta_agent_id?: string;
  personal_context: Record<string, any>;

  // Device Tracking
  device_token?: string;
  app_version?: string;
  last_active_at?: string;
  last_heartbeat_at?: string;

  // Status
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PatientCreate {
  first_name: string;
  last_name: string;
  date_of_birth: string;

  // Optional Demographics
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone_number?: string;
  address?: string;

  // Optional Emergency Contacts
  emergency_contact_name?: string;
  emergency_contact_phone?: string;

  // Optional Medical Information
  medical_conditions?: string[];
  medications?: string[];
  allergies?: string[];
  dietary_restrictions?: string[];

  // Optional Personalization
  profile_photo_url?: string;
  timezone?: string;
  preferred_voice?: 'male' | 'female' | 'neutral';
  communication_style?: 'friendly' | 'formal' | 'casual';
  language?: string;
}

export interface PatientUpdate {
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  phone_number?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string[];
  medications?: string[];
  allergies?: string[];
  dietary_restrictions?: string[];
  profile_photo_url?: string;
  timezone?: string;
  preferred_voice?: 'male' | 'female' | 'neutral';
  communication_style?: 'friendly' | 'formal' | 'casual';
  language?: string;
}

// For list display
export interface PatientSummary {
  id: string;
  full_name: string;
  display_name: string;
  age: number;
  profile_photo_url?: string;
  last_active_at?: string;
  last_heartbeat_at?: string;
  is_active: boolean;
  alert_count?: number; // Will be fetched separately
}
