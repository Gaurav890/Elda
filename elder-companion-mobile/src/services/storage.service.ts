/**
 * Storage Service
 * Wrapper around AsyncStorage for local data persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config/constants';
import { AppSettings, PendingMessage } from '../types';

class StorageService {
  // Patient ID
  async getPatientId(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.PATIENT_ID);
  }

  async setPatientId(patientId: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.PATIENT_ID, patientId);
  }

  async clearPatientId(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.PATIENT_ID);
  }

  // Device Token
  async getDeviceToken(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_TOKEN);
  }

  async setDeviceToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_TOKEN, token);
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (settingsJson) {
      return JSON.parse(settingsJson);
    }
    // Default settings
    return {
      volume: 0.8,
      ttsRate: 0.9,
      language: 'en-US',
    };
  }

  async setSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // Pending Messages (for offline queue)
  async getPendingMessages(): Promise<PendingMessage[]> {
    const messagesJson = await AsyncStorage.getItem(
      STORAGE_KEYS.PENDING_MESSAGES,
    );
    if (messagesJson) {
      return JSON.parse(messagesJson);
    }
    return [];
  }

  async addPendingMessage(message: PendingMessage): Promise<void> {
    const messages = await this.getPendingMessages();
    messages.push(message);
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_MESSAGES,
      JSON.stringify(messages),
    );
  }

  async removePendingMessage(messageId: string): Promise<void> {
    const messages = await this.getPendingMessages();
    const filtered = messages.filter(m => m.id !== messageId);
    await AsyncStorage.setItem(
      STORAGE_KEYS.PENDING_MESSAGES,
      JSON.stringify(filtered),
    );
  }

  async clearPendingMessages(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_MESSAGES);
  }

  // Last Sync
  async getLastSyncTimestamp(): Promise<string | null> {
    return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
  }

  async setLastSyncTimestamp(timestamp: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
  }

  // Clear all app data
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.PATIENT_ID,
      STORAGE_KEYS.DEVICE_TOKEN,
      STORAGE_KEYS.PENDING_MESSAGES,
      STORAGE_KEYS.LAST_SYNC,
      STORAGE_KEYS.SETTINGS,
    ]);
  }
}

export const storageService = new StorageService();
