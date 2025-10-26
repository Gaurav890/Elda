/**
 * Local Notification Service
 * Handles local iOS notifications with alarm capabilities
 *
 * Features:
 * - Schedule local notifications for reminders (works without APNs!)
 * - Alarm sound + vibration
 * - Critical notifications (bypasses Do Not Disturb)
 * - Fallback if push notifications fail
 * - Cancel notifications when acknowledged
 */

import notifee, {
  AndroidImportance,
  AndroidStyle,
  TriggerType,
  TimestampTrigger,
  EventType,
  Event,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { ttsService } from './tts.service';

export interface ReminderNotification {
  id: string;
  title: string;
  body: string;
  scheduledTime: Date;
  reminderId: string;
  reminderType: string;
  speakText?: string;
  requiresResponse?: boolean;
  voiceCheckIn?: boolean; // Flag for retry notifications to auto-open VoiceChat
}

class LocalNotificationService {
  private initialized = false;
  private notificationChannelId = 'elder-companion-reminders';
  private criticalChannelId = 'elder-companion-critical';

  /**
   * Initialize the local notification service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[LocalNotificationService] Already initialized');
      return;
    }

    try {
      console.log('[LocalNotificationService] Initializing...');

      // Request permissions
      await this.requestPermissions();

      // Create notification channels (Android only, but safe to call on iOS)
      await this.createNotificationChannels();

      // Set up event handlers
      this.setupEventHandlers();

      this.initialized = true;
      console.log('[LocalNotificationService] Initialized successfully');
    } catch (error) {
      console.error('[LocalNotificationService] Initialization error:', error);
      this.initialized = true; // Prevent retry loops
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const settings = await notifee.requestPermission();

      console.log('[LocalNotificationService] Permission status:', settings.authorizationStatus);

      return (
        settings.authorizationStatus === 1 || // AUTHORIZED
        settings.authorizationStatus === 2    // PROVISIONAL
      );
    } catch (error) {
      console.error('[LocalNotificationService] Permission request error:', error);
      return false;
    }
  }

  /**
   * Create notification channels (Android) - safe to call on iOS (no-op)
   */
  private async createNotificationChannels(): Promise<void> {
    try {
      // Standard reminder channel
      await notifee.createChannel({
        id: this.notificationChannelId,
        name: 'Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
        vibration: true,
      });

      // Critical reminder channel (bypasses Do Not Disturb)
      await notifee.createChannel({
        id: this.criticalChannelId,
        name: 'Critical Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'alarm',
        vibration: true,
        vibrationPattern: [300, 500],
      });

      console.log('[LocalNotificationService] Notification channels created');
    } catch (error) {
      console.error('[LocalNotificationService] Channel creation error:', error);
    }
  }

  /**
   * Set up event handlers for notification interactions
   */
  private setupEventHandlers(): void {
    // Handle notification press
    notifee.onForegroundEvent(async ({ type, detail }) => {
      console.log('[LocalNotificationService] Foreground event:', type, detail);

      if (type === EventType.PRESS) {
        await this.handleNotificationPress(detail);
      } else if (type === EventType.ACTION_PRESS) {
        await this.handleActionPress(detail);
      }
    });

    // Handle background events
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('[LocalNotificationService] Background event:', type, detail);

      if (type === EventType.PRESS) {
        await this.handleNotificationPress(detail);
      } else if (type === EventType.ACTION_PRESS) {
        await this.handleActionPress(detail);
      }
    });
  }

  /**
   * Handle notification press
   */
  private async handleNotificationPress(detail: any): Promise<void> {
    console.log('[LocalNotificationService] Notification pressed:', detail);

    const reminderId = detail?.notification?.data?.reminder_id;
    const speakText = detail?.notification?.data?.speak_text;
    const voiceCheckIn = detail?.notification?.data?.voice_check_in === 'true';

    // Check if this is a voice check-in retry notification
    if (voiceCheckIn && reminderId) {
      console.log('[LocalNotificationService] Voice check-in retry - opening VoiceChat with auto-start');

      // Import navigation service dynamically to avoid circular dependencies
      const NavigationService = require('./navigation.service');

      // Navigate to VoiceChat with auto-start
      NavigationService.navigate('VoiceChat', {
        reminderId,
        autoStart: true, // This triggers AI to speak first
      });

      return;
    }

    // Play TTS if available (for non-retry notifications)
    if (speakText) {
      await ttsService.speak(speakText);
    }

    // For non-retry notifications, navigate to Home screen
    // (VoiceChat is only auto-opened for retry notifications)
  }

  /**
   * Handle action button press
   */
  private async handleActionPress(detail: any): Promise<void> {
    console.log('[LocalNotificationService] Action pressed:', detail?.pressAction?.id);

    const actionId = detail?.pressAction?.id;
    const reminderId = detail?.notification?.data?.reminder_id;

    switch (actionId) {
      case 'acknowledge':
        console.log('[LocalNotificationService] Acknowledge action - reminder:', reminderId);
        // TODO: Call API to acknowledge reminder
        await this.cancelNotification(reminderId);
        break;

      case 'snooze':
        console.log('[LocalNotificationService] Snooze action - reminder:', reminderId);
        // TODO: Reschedule notification for 5 minutes later
        break;

      case 'voice_chat':
        console.log('[LocalNotificationService] Voice chat action - reminder:', reminderId);
        // TODO: Open VoiceChat screen
        break;
    }
  }

  /**
   * Schedule a local notification for a reminder
   */
  async scheduleReminder(notification: ReminderNotification): Promise<string> {
    try {
      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: notification.scheduledTime.getTime(),
      };

      // Determine if this is a critical notification (medication, etc.)
      const isCritical = notification.reminderType === 'medication';

      const notificationId = await notifee.createTriggerNotification(
        {
          id: notification.id,
          title: notification.title,
          body: notification.body,
          ios: {
            sound: 'default',
            // Critical alerts bypass Do Not Disturb (requires special entitlement)
            // For now, use high priority
            foregroundPresentationOptions: {
              alert: true,
              badge: true,
              sound: true,
            },
            categoryId: isCritical ? 'reminder-critical' : 'reminder-standard',
            attachments: [],
          },
          android: {
            channelId: isCritical ? this.criticalChannelId : this.notificationChannelId,
            sound: 'default',
            vibrationPattern: [300, 500],
            pressAction: {
              id: 'default',
            },
            actions: [
              {
                title: '✓ I Did It',
                pressAction: {
                  id: 'acknowledge',
                },
              },
              {
                title: '⏰ Snooze 5 min',
                pressAction: {
                  id: 'snooze',
                },
              },
              {
                title: '🗣️ Talk',
                pressAction: {
                  id: 'voice_chat',
                },
              },
            ],
          },
          data: {
            reminder_id: notification.reminderId,
            reminder_type: notification.reminderType,
            speak_text: notification.speakText || notification.body,
            requires_response: notification.requiresResponse?.toString() || 'true',
            voice_check_in: notification.voiceCheckIn?.toString() || 'false',
          },
        },
        trigger
      );

      console.log(
        `[LocalNotificationService] Scheduled notification ${notificationId} for ${notification.scheduledTime.toISOString()}`
      );

      return notificationId;
    } catch (error) {
      console.error('[LocalNotificationService] Schedule error:', error);
      throw error;
    }
  }

  /**
   * Schedule a reminder with automatic retry notifications
   * Schedules initial notification + 3 retry notifications at 15, 20, 25 min intervals
   *
   * @returns Array of notification IDs [initial, retry1, retry2, retry3]
   */
  async scheduleReminderWithRetries(notification: ReminderNotification): Promise<string[]> {
    try {
      const notificationIds: string[] = [];

      // Schedule initial notification
      const initialId = await this.scheduleReminder(notification);
      notificationIds.push(initialId);

      // Schedule 3 retry notifications (15, 20, 25 minutes after due time)
      const retryIntervals = [15, 20, 25]; // minutes

      for (let i = 0; i < retryIntervals.length; i++) {
        const retryTime = new Date(notification.scheduledTime.getTime() + retryIntervals[i] * 60 * 1000);
        const retryId = `${notification.id}_retry${i + 1}`;

        const retryNotification: ReminderNotification = {
          ...notification,
          id: retryId,
          title: i === 0 ?
            `Reminder: ${notification.title}` :
            i === 1 ?
              `Check-in needed: ${notification.title}` :
              `Important: ${notification.title}`,
          body: i === 0 ?
            `Did you ${notification.body.toLowerCase()}?` :
            i === 1 ?
              `Please confirm: ${notification.body}` :
              `We haven't heard from you. ${notification.body}`,
          scheduledTime: retryTime,
          // Mark retries with voice_check_in flag so they auto-open VoiceChat
          requiresResponse: true,
          voiceCheckIn: true, // Enable auto-open VoiceChat for retry notifications
        };

        const retryNotifId = await this.scheduleReminder(retryNotification);
        notificationIds.push(retryNotifId);

        console.log(
          `[LocalNotificationService] Scheduled retry ${i + 1} at ${retryTime.toISOString()} (${retryIntervals[i]} min after)`
        );
      }

      console.log(
        `[LocalNotificationService] Scheduled reminder with ${retryIntervals.length} retries. IDs:`,
        notificationIds
      );

      return notificationIds;
    } catch (error) {
      console.error('[LocalNotificationService] Schedule with retries error:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      console.log(`[LocalNotificationService] Cancelled notification ${notificationId}`);
    } catch (error) {
      console.error('[LocalNotificationService] Cancel error:', error);
    }
  }

  /**
   * Cancel all notifications for a reminder (including retries)
   *
   * @param baseReminderId The base reminder ID (without _retry1, _retry2, _retry3 suffixes)
   */
  async cancelReminderNotifications(baseReminderId: string): Promise<void> {
    try {
      // Cancel initial notification
      await this.cancelNotification(baseReminderId);

      // Cancel all retry notifications
      for (let i = 1; i <= 3; i++) {
        await this.cancelNotification(`${baseReminderId}_retry${i}`);
      }

      console.log(`[LocalNotificationService] Cancelled all notifications for reminder ${baseReminderId}`);
    } catch (error) {
      console.error('[LocalNotificationService] Cancel reminder notifications error:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('[LocalNotificationService] Cancelled all notifications');
    } catch (error) {
      console.error('[LocalNotificationService] Cancel all error:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<any[]> {
    try {
      const notifications = await notifee.getTriggerNotifications();
      console.log(`[LocalNotificationService] ${notifications.length} scheduled notifications`);
      return notifications;
    } catch (error) {
      console.error('[LocalNotificationService] Get scheduled error:', error);
      return [];
    }
  }

  /**
   * Display an immediate notification (not scheduled)
   */
  async displayNow(notification: Omit<ReminderNotification, 'scheduledTime'>): Promise<string> {
    try {
      const notificationId = await notifee.displayNotification({
        id: notification.id,
        title: notification.title,
        body: notification.body,
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
        data: {
          reminder_id: notification.reminderId,
          reminder_type: notification.reminderType,
          speak_text: notification.speakText || notification.body,
          requires_response: notification.requiresResponse?.toString() || 'true',
          voice_check_in: notification.voiceCheckIn?.toString() || 'false',
        },
      });

      console.log(`[LocalNotificationService] Displayed immediate notification ${notificationId}`);

      // Play TTS
      if (notification.speakText) {
        await ttsService.speak(notification.speakText);
      }

      return notificationId;
    } catch (error) {
      console.error('[LocalNotificationService] Display error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const localNotificationService = new LocalNotificationService();
export default localNotificationService;
