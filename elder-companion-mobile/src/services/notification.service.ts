/**
 * Notification Service
 * Handles Firebase Cloud Messaging (FCM) for push notifications
 *
 * Features:
 * - FCM token registration and refresh
 * - Foreground notification handling
 * - Background notification handling
 * - Permission management
 * - TTS playback on notification arrival
 */

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import { storageService } from './storage.service';
import { apiService } from './api.service';
import { ttsService } from './tts.service';
import * as NavigationService from './navigation.service';

const STORAGE_KEY_FCM_TOKEN = 'fcm_token';

export interface NotificationPayload {
  // Reminder fields (from backend)
  type?: 'reminder' | 'alert' | 'check_in';
  reminder_id?: string;
  reminder_type?: string; // medication, meal, exercise, etc.
  speak_text?: string; // TTS message from backend
  requires_response?: boolean;
  voice_check_in?: boolean; // Flag for retry notifications that should open voice chat
  retry_count?: string; // Number of retries for this reminder

  // Legacy/general fields
  patient_id?: string;
  message: string;
  title: string;
  notification_type?: 'medication_reminder' | 'check_in' | 'emergency' | 'general';
  priority?: 'high' | 'medium' | 'low';
  tts_message?: string;
}

class NotificationService {
  private initialized = false;
  private currentToken: string | null = null;

  /**
   * Initialize the notification service
   * Call this once on app start
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[NotificationService] Already initialized');
      return;
    }

    try {
      console.log('[NotificationService] Initializing...');

      // Small delay to ensure Firebase is ready
      await new Promise(resolve => setTimeout(resolve, 500));

      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.warn('[NotificationService] Permission denied - skipping token registration');
        // Still mark as initialized to prevent retry loops
        this.initialized = true;
        return;
      }

      // Get FCM token
      await this.registerToken();

      // Setup message handlers
      this.setupMessageHandlers();

      this.initialized = true;
      console.log('[NotificationService] Initialized successfully');
    } catch (error) {
      console.error('[NotificationService] Initialization error:', error);
      // Mark as initialized even on error to prevent crash loops
      this.initialized = true;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log('[NotificationService] Permission status:', authStatus);
      return enabled;
    } catch (error) {
      console.error('[NotificationService] Permission request error:', error);
      return false;
    }
  }

  /**
   * Get FCM token and register with backend
   */
  async registerToken(): Promise<string | null> {
    try {
      // Get FCM token
      const token = await messaging().getToken();
      console.log('[NotificationService] FCM Token:', token.substring(0, 20) + '...');

      // Check if token changed
      const storedToken = await storageService.getItem(STORAGE_KEY_FCM_TOKEN);
      if (storedToken === token) {
        console.log('[NotificationService] Token unchanged, skipping backend update');
        this.currentToken = token;
        return token;
      }

      // Store token locally
      await storageService.setItem(STORAGE_KEY_FCM_TOKEN, token);
      this.currentToken = token;

      // Send token to backend
      await this.sendTokenToBackend(token);

      // Listen for token refresh
      messaging().onTokenRefresh(async (newToken) => {
        console.log('[NotificationService] Token refreshed:', newToken.substring(0, 20) + '...');
        await storageService.setItem(STORAGE_KEY_FCM_TOKEN, newToken);
        this.currentToken = newToken;
        await this.sendTokenToBackend(newToken);
      });

      return token;
    } catch (error: any) {
      // iOS Simulator doesn't support APNs - this is expected
      if (error?.code === 'messaging/unregistered') {
        console.log('[NotificationService] Running on iOS Simulator - push notifications not available');
        console.log('[NotificationService] This is normal - notifications will work on a real device');
        return null;
      }
      console.error('[NotificationService] Token registration error:', error);
      return null;
    }
  }

  /**
   * Send FCM token to backend
   */
  private async sendTokenToBackend(token: string): Promise<void> {
    try {
      // Get patient ID from storage
      const patientId = await storageService.getItem('patient_id');
      if (!patientId) {
        console.warn('[NotificationService] No patient ID, skipping backend registration');
        return;
      }

      console.log('[NotificationService] Sending token to backend...');
      await apiService.registerDeviceToken(patientId, token);
      console.log('[NotificationService] Token registered with backend');
    } catch (error) {
      console.error('[NotificationService] Backend registration error:', error);
    }
  }

  /**
   * Setup foreground and background message handlers
   */
  private setupMessageHandlers(): void {
    // Foreground messages (app is open)
    messaging().onMessage(async (remoteMessage) => {
      console.log('[NotificationService] Foreground message:', remoteMessage);
      await this.handleForegroundMessage(remoteMessage);
    });

    // Background messages (app is in background or quit)
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('[NotificationService] Background message:', remoteMessage);
      await this.handleBackgroundMessage(remoteMessage);
    });

    // Notification opened (user tapped notification)
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('[NotificationService] Notification opened app:', remoteMessage);
      this.handleNotificationOpened(remoteMessage);
    });

    // Check if app was opened from a notification (cold start)
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('[NotificationService] App opened from notification:', remoteMessage);
          this.handleNotificationOpened(remoteMessage);
        }
      });
  }

  /**
   * Handle foreground notification (app is open)
   */
  private async handleForegroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      const payload = this.parseNotificationPayload(remoteMessage);
      if (!payload) return;

      console.log('[NotificationService] Foreground payload:', payload);

      // Check if this is a retry with voice check-in flag
      if (payload.voice_check_in) {
        console.log('[NotificationService] Voice check-in requested - opening VoiceChat');
        console.log(`[NotificationService] Retry count: ${payload.retry_count || 'unknown'}`);

        // Navigate to VoiceChat immediately
        NavigationService.navigate('VoiceChat', {
          reminderId: payload.reminder_id,
          autoStart: true, // Flag to auto-start check-in mode
        });

        // Play TTS
        const ttsMessage = payload.speak_text || payload.tts_message || payload.message;
        await ttsService.speak(ttsMessage);

        return; // Skip the alert dialog for voice check-in
      }

      // Play TTS for reminders (backend sends speak_text)
      const shouldPlayTTS =
        payload.type === 'reminder' ||
        payload.notification_type === 'medication_reminder';

      if (shouldPlayTTS) {
        const ttsMessage = payload.speak_text || payload.tts_message || payload.message;
        console.log('[NotificationService] Playing TTS:', ttsMessage);
        await ttsService.speak(ttsMessage);
      }

      // Show in-app alert
      Alert.alert(
        payload.title,
        payload.message,
        [
          {
            text: 'Dismiss',
            style: 'cancel',
          },
          {
            text: 'View',
            onPress: () => {
              // Navigate to appropriate screen
              const navType = payload.type || payload.notification_type;
              console.log('[NotificationService] Navigate to:', navType);
            },
          },
        ]
      );
    } catch (error) {
      console.error('[NotificationService] Foreground message handling error:', error);
    }
  }

  /**
   * Handle background notification
   */
  private async handleBackgroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      const payload = this.parseNotificationPayload(remoteMessage);
      if (!payload) return;

      console.log('[NotificationService] Background payload:', payload);

      // Log notification receipt
      // Background handler cannot directly interact with UI or play TTS
      // TTS will play when user opens the app
    } catch (error) {
      console.error('[NotificationService] Background message handling error:', error);
    }
  }

  /**
   * Handle notification opened by user
   */
  private handleNotificationOpened(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): void {
    try {
      const payload = this.parseNotificationPayload(remoteMessage);
      if (!payload) return;

      console.log('[NotificationService] Opened payload:', payload);

      // Check if this is a retry with voice check-in flag
      if (payload.voice_check_in) {
        console.log('[NotificationService] Voice check-in requested - opening VoiceChat');
        console.log(`[NotificationService] Retry count: ${payload.retry_count || 'unknown'}`);

        // Navigate to VoiceChat with auto-start
        NavigationService.navigate('VoiceChat', {
          reminderId: payload.reminder_id,
          autoStart: true,
        });
        return;
      }

      // Navigate to appropriate screen based on notification type
      switch (payload.notification_type) {
        case 'medication_reminder':
          // Navigate to reminders screen (Home)
          console.log('[NotificationService] Navigate to reminders');
          NavigationService.navigate('Home');
          break;
        case 'check_in':
          // Navigate to voice chat screen
          console.log('[NotificationService] Navigate to voice chat');
          NavigationService.navigate('VoiceChat', {
            reminderId: payload.reminder_id,
          });
          break;
        case 'emergency':
          // Show emergency details
          console.log('[NotificationService] Show emergency details');
          break;
        default:
          console.log('[NotificationService] No specific navigation');
      }
    } catch (error) {
      console.error('[NotificationService] Notification opened handling error:', error);
    }
  }

  /**
   * Parse notification payload from remote message
   */
  private parseNotificationPayload(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): NotificationPayload | null {
    try {
      // FCM sends data in 'data' field for custom payloads
      const data = remoteMessage.data || {};

      // FCM also has 'notification' field for display
      const notification = remoteMessage.notification;

      return {
        // Backend reminder fields
        type: data.type as any,
        reminder_id: data.reminder_id as string,
        reminder_type: data.reminder_type as string,
        speak_text: data.speak_text as string,
        requires_response: data.requires_response === 'true' || data.requires_response === true,
        voice_check_in: data.voice_check_in === 'true' || data.voice_check_in === true,
        retry_count: data.retry_count as string,

        // Legacy/general fields
        patient_id: data.patient_id as string,
        message: (notification?.body || data.message || 'New notification') as string,
        title: (notification?.title || data.title || 'Elder Companion') as string,
        notification_type: (data.notification_type || 'general') as NotificationPayload['notification_type'],
        priority: (data.priority || 'medium') as NotificationPayload['priority'],
        tts_message: data.tts_message as string,
      };
    } catch (error) {
      console.error('[NotificationService] Payload parsing error:', error);
      return null;
    }
  }

  /**
   * Get current FCM token
   */
  getCurrentToken(): string | null {
    return this.currentToken;
  }

  /**
   * Check if notifications are enabled
   */
  async areNotificationsEnabled(): Promise<boolean> {
    const authStatus = await messaging().hasPermission();
    return (
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    );
  }

  /**
   * Unregister device token (on logout/reset)
   */
  async unregisterToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      await storageService.removeItem(STORAGE_KEY_FCM_TOKEN);
      this.currentToken = null;
      console.log('[NotificationService] Token unregistered');
    } catch (error) {
      console.error('[NotificationService] Token unregistration error:', error);
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;
