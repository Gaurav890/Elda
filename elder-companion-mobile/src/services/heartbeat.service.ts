/**
 * Heartbeat Service
 * Sends periodic heartbeats to backend with device status
 *
 * Features:
 * - Background execution every 15 minutes
 * - Battery level monitoring
 * - Network connectivity status
 * - App state tracking
 * - Emergency alert support
 * - Automatic retry on failure
 */

import BackgroundFetch from 'react-native-background-fetch';
import DeviceInfo from 'react-native-device-info';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { apiService } from './api.service';
import { storageService } from './storage.service';

const HEARTBEAT_TASK_ID = 'com.eldercompanion.heartbeat';
const HEARTBEAT_INTERVAL = 15; // minutes

export interface HeartbeatPayload {
  battery_level: number;
  app_state: 'active' | 'background' | 'inactive';
  activity_type: 'heartbeat' | 'emergency';
  network_type: string;
  last_interaction?: string;
  is_charging?: boolean;
  device_info?: {
    model: string;
    os_version: string;
    app_version: string;
  };
}

class HeartbeatService {
  private initialized = false;
  private lastHeartbeatTime: Date | null = null;

  /**
   * Initialize background heartbeat service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[HeartbeatService] Already initialized');
      return;
    }

    try {
      console.log('[HeartbeatService] Initializing...');

      // Configure BackgroundFetch
      const status = await BackgroundFetch.configure(
        {
          minimumFetchInterval: HEARTBEAT_INTERVAL, // 15 minutes
          stopOnTerminate: false, // Continue after app is closed
          startOnBoot: true, // Start after device reboot
          enableHeadless: true, // Enable headless JS task (Android)
          requiredNetworkType: BackgroundFetch.NETWORK_TYPE_ANY,
          requiresCharging: false,
          requiresDeviceIdle: false,
          requiresBatteryNotLow: false,
        },
        async (taskId) => {
          console.log('[HeartbeatService] Background task fired:', taskId);
          await this.sendHeartbeat('heartbeat');

          // Tell OS we're done
          BackgroundFetch.finish(taskId);
        },
        (taskId) => {
          console.warn('[HeartbeatService] Background task timeout:', taskId);
          BackgroundFetch.finish(taskId);
        }
      );

      console.log('[HeartbeatService] BackgroundFetch status:', status);

      // Schedule the background task
      await BackgroundFetch.scheduleTask({
        taskId: HEARTBEAT_TASK_ID,
        delay: 0, // Start immediately
        periodic: true,
        forceAlarmManager: true, // Use AlarmManager on Android (more reliable)
        stopOnTerminate: false,
        startOnBoot: true,
        enableHeadless: true,
      });

      this.initialized = true;
      console.log('[HeartbeatService] Initialized successfully');

      // Send initial heartbeat
      await this.sendHeartbeat('heartbeat');
    } catch (error) {
      console.error('[HeartbeatService] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Send heartbeat to backend
   */
  async sendHeartbeat(activityType: 'heartbeat' | 'emergency' = 'heartbeat'): Promise<void> {
    try {
      console.log(`[HeartbeatService] Sending ${activityType}...`);

      // Get patient ID
      const patientId = await storageService.getItem('patient_id');
      if (!patientId) {
        console.warn('[HeartbeatService] No patient ID found, skipping heartbeat');
        return;
      }

      // Collect device information
      const payload = await this.collectDeviceInfo(activityType);

      // Send to backend
      await apiService.sendHeartbeat(patientId, payload);

      this.lastHeartbeatTime = new Date();
      console.log('[HeartbeatService] Heartbeat sent successfully');
    } catch (error) {
      console.error('[HeartbeatService] Failed to send heartbeat:', error);
      // Don't throw - we'll retry on next cycle
    }
  }

  /**
   * Send emergency alert
   */
  async sendEmergencyAlert(): Promise<void> {
    try {
      console.log('[HeartbeatService] Sending EMERGENCY alert');
      await this.sendHeartbeat('emergency');
      console.log('[HeartbeatService] Emergency alert sent successfully');
    } catch (error) {
      console.error('[HeartbeatService] Failed to send emergency alert:', error);
      throw error;
    }
  }

  /**
   * Collect device information for heartbeat payload
   */
  private async collectDeviceInfo(activityType: 'heartbeat' | 'emergency'): Promise<HeartbeatPayload> {
    try {
      // Get battery level (0-1 scale, convert to percentage)
      let batteryLevel = 100;
      try {
        const battery = await DeviceInfo.getBatteryLevel();
        batteryLevel = Math.round(battery * 100);
      } catch (error) {
        console.warn('[HeartbeatService] Could not get battery level:', error);
      }

      // Get charging state
      let isCharging = false;
      try {
        isCharging = await DeviceInfo.isBatteryCharging();
      } catch (error) {
        console.warn('[HeartbeatService] Could not get charging state:', error);
      }

      // Get app state
      const appState = AppState.currentState === 'active' ? 'active' :
                       AppState.currentState === 'background' ? 'background' : 'inactive';

      // Get network state
      const netInfo = await NetInfo.fetch();
      const networkType = netInfo.type || 'unknown';

      // Get device info
      const deviceModel = await DeviceInfo.getModel();
      const osVersion = await DeviceInfo.getSystemVersion();
      const appVersion = await DeviceInfo.getVersion();

      // Get last interaction time from storage
      const lastInteraction = await storageService.getItem('last_interaction_time');

      const payload: HeartbeatPayload = {
        battery_level: batteryLevel,
        app_state: appState,
        activity_type: activityType,
        network_type: networkType,
        last_interaction: lastInteraction || undefined,
        is_charging: isCharging,
        device_info: {
          model: deviceModel,
          os_version: osVersion,
          app_version: appVersion,
        },
      };

      console.log('[HeartbeatService] Payload:', {
        battery_level: payload.battery_level,
        app_state: payload.app_state,
        activity_type: payload.activity_type,
        network_type: payload.network_type,
        is_charging: payload.is_charging,
      });

      return payload;
    } catch (error) {
      console.error('[HeartbeatService] Error collecting device info:', error);
      // Return minimal payload
      return {
        battery_level: 100,
        app_state: 'active',
        activity_type: activityType,
        network_type: 'unknown',
      };
    }
  }

  /**
   * Get status of heartbeat service
   */
  async getStatus(): Promise<{
    initialized: boolean;
    lastHeartbeat: Date | null;
    backgroundFetchStatus: number;
  }> {
    const status = await BackgroundFetch.status();
    return {
      initialized: this.initialized,
      lastHeartbeat: this.lastHeartbeatTime,
      backgroundFetchStatus: status,
    };
  }

  /**
   * Stop heartbeat service
   */
  async stop(): Promise<void> {
    try {
      await BackgroundFetch.stop();
      this.initialized = false;
      console.log('[HeartbeatService] Stopped');
    } catch (error) {
      console.error('[HeartbeatService] Error stopping:', error);
    }
  }

  /**
   * Force send heartbeat now (for testing)
   */
  async forceSendHeartbeat(): Promise<void> {
    console.log('[HeartbeatService] Force sending heartbeat...');
    await this.sendHeartbeat('heartbeat');
  }

  /**
   * Check if low battery and alert if needed
   */
  async checkLowBattery(): Promise<boolean> {
    try {
      const battery = await DeviceInfo.getBatteryLevel();
      const batteryPercent = Math.round(battery * 100);

      if (batteryPercent < 20) {
        console.warn('[HeartbeatService] LOW BATTERY:', batteryPercent + '%');
        // Send low battery alert via heartbeat
        await this.sendHeartbeat('heartbeat');
        return true;
      }
      return false;
    } catch (error) {
      console.error('[HeartbeatService] Error checking battery:', error);
      return false;
    }
  }
}

export const heartbeatService = new HeartbeatService();
export default heartbeatService;
