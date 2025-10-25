// Authentication API Functions

import apiClient from './axios';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  Caregiver,
  CaregiverPreferences,
} from '@/types/auth';
import { setAccessToken, setRefreshToken, setUser } from '@/lib/auth/storage';

/**
 * Login with email and password
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  // Backend returns tokens only, not caregiver object
  const tokenResponse = await apiClient.post('/api/v1/auth/login', credentials);

  // Store tokens
  const { access_token, refresh_token } = tokenResponse.data;
  setAccessToken(access_token);
  setRefreshToken(refresh_token);

  // Fetch caregiver data with the new token
  const caregiverResponse = await apiClient.get<Caregiver>('/api/v1/auth/me');
  const caregiver = caregiverResponse.data;
  setUser(caregiver);

  return {
    access_token,
    refresh_token,
    caregiver,
  };
}

/**
 * Register new caregiver account
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  // Backend returns caregiver object (not tokens) on registration
  const caregiverResponse = await apiClient.post<Caregiver>('/api/v1/auth/register', data);
  const caregiver = caregiverResponse.data;

  // Now login to get tokens
  const loginResponse = await login({
    email: data.email,
    password: data.password,
  });

  return loginResponse;
}

/**
 * Refresh access token
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>('/api/v1/auth/refresh', data);
  return response.data;
}

/**
 * Get current caregiver profile
 */
export async function getCurrentCaregiver(): Promise<Caregiver> {
  const response = await apiClient.get<Caregiver>('/api/v1/auth/me');
  return response.data;
}

/**
 * Update current caregiver profile
 */
export async function updateProfile(data: Partial<Caregiver>): Promise<Caregiver> {
  const response = await apiClient.patch<Caregiver>('/api/v1/auth/me', data);

  // Update stored user data
  setUser(response.data);

  return response.data;
}

/**
 * Change password
 */
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await apiClient.post('/api/v1/auth/change-password', data);
}

/**
 * Get caregiver preferences
 */
export async function getPreferences(): Promise<CaregiverPreferences> {
  const response = await apiClient.get<CaregiverPreferences>('/api/v1/auth/me/preferences');
  return response.data;
}

/**
 * Update caregiver preferences
 */
export async function updatePreferences(
  data: Partial<CaregiverPreferences>
): Promise<CaregiverPreferences> {
  const response = await apiClient.patch<CaregiverPreferences>(
    '/api/v1/auth/me/preferences',
    data
  );
  return response.data;
}
