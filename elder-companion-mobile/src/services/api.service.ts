/**
 * API Service
 * Handles all HTTP communication with backend
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { Platform } from 'react-native';
import { API_CONFIG, API_ENDPOINTS } from '../config/api';
import { APP_CONFIG } from '../config/constants';
import {
  MobileSetupRequest,
  MobileSetupResponse,
  DeviceTokenRequest,
  DeviceTokenResponse,
  VoiceInteractRequest,
  VoiceInteractResponse,
  HeartbeatRequest,
  HeartbeatResponse,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      (error: AxiosError) => {
        console.error('API Error:', error.message);
        return Promise.reject(error);
      },
    );
  }

  /**
   * Setup mobile device with QR code data
   */
  async setupDevice(
    patientId: string,
    setupToken: string,
  ): Promise<MobileSetupResponse> {
    const request: MobileSetupRequest = {
      patient_id: patientId,
      setup_token: setupToken,
    };

    const response = await this.api.post<MobileSetupResponse>(
      API_ENDPOINTS.MOBILE_SETUP,
      request,
    );

    return response.data;
  }

  /**
   * Register device token for push notifications
   */
  async registerDeviceToken(
    patientId: string,
    deviceToken: string,
  ): Promise<DeviceTokenResponse> {
    const request: DeviceTokenRequest = {
      patient_id: patientId,
      device_token: deviceToken,
      platform: Platform.OS as 'ios' | 'android',
      app_version: APP_CONFIG.APP_VERSION,
    };

    const response = await this.api.post<DeviceTokenResponse>(
      API_ENDPOINTS.DEVICE_TOKEN,
      request,
    );

    return response.data;
  }

  /**
   * Send voice message to backend for AI processing
   */
  async sendVoiceMessage(
    patientId: string,
    message: string,
    conversationType:
      | 'spontaneous'
      | 'reminder_response'
      | 'check_in'
      | 'emergency' = 'spontaneous',
    context?: Record<string, any>,
  ): Promise<VoiceInteractResponse> {
    const request: VoiceInteractRequest = {
      patient_id: patientId,
      message,
      conversation_type: conversationType,
      context,
    };

    const response = await this.api.post<VoiceInteractResponse>(
      API_ENDPOINTS.VOICE_INTERACT,
      request,
    );

    return response.data;
  }

  /**
   * Send heartbeat to backend for activity tracking
   */
  async sendHeartbeat(
    patientId: string,
    payload: {
      battery_level: number;
      app_state: string;
      activity_type: string;
      network_type: string;
      last_interaction?: string;
      is_charging?: boolean;
      device_info?: any;
    },
  ): Promise<HeartbeatResponse> {
    const request: HeartbeatRequest = {
      activity_type: payload.activity_type,
      device_type: Platform.OS,
      app_version: APP_CONFIG.APP_VERSION,
      battery_level: payload.battery_level,
      latitude: undefined,
      longitude: undefined,
      details: {
        app_state: payload.app_state,
        network_type: payload.network_type,
        last_interaction: payload.last_interaction,
        is_charging: payload.is_charging,
        device_info: payload.device_info,
      },
    };

    const response = await this.api.post<HeartbeatResponse>(
      API_ENDPOINTS.PATIENT_HEARTBEAT(patientId),
      request,
    );

    return response.data;
  }

  /**
   * Get patient details (optional - for displaying info)
   */
  async getPatientDetails(patientId: string): Promise<any> {
    const response = await this.api.get(
      API_ENDPOINTS.PATIENT_DETAIL(patientId),
    );
    return response.data;
  }

  /**
   * Get patient schedules (medications and meals)
   */
  async getPatientSchedules(patientId: string): Promise<any[]> {
    const response = await this.api.get(
      API_ENDPOINTS.PATIENT_SCHEDULES(patientId),
    );
    return response.data;
  }

  /**
   * Get upcoming reminders (optional - for next reminder display)
   */
  async getUpcomingReminders(patientId: string): Promise<any> {
    const response = await this.api.get(
      API_ENDPOINTS.PATIENT_REMINDERS(patientId),
    );
    return response.data;
  }

  /**
   * Acknowledge a reminder (mark as completed, missed, or snoozed)
   */
  async acknowledgeReminder(
    reminderId: string,
    status: 'completed' | 'missed' | 'snoozed',
    patientResponse?: string,
    notes?: string,
  ): Promise<any> {
    const response = await this.api.put(
      API_ENDPOINTS.ACKNOWLEDGE_REMINDER(reminderId),
      {
        status,
        patient_response: patientResponse,
        notes,
      },
    );
    return response.data;
  }
}

export const apiService = new ApiService();
