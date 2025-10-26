import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api.service';

const PENDING_MESSAGES_KEY = 'pending_messages';
const MAX_RETRIES = 5;

export interface PendingMessage {
  id: string;
  patient_id: string;
  message: string;
  conversation_type: 'spontaneous' | 'reminder_response' | 'check_in' | 'emergency';
  timestamp: Date;
  retry_count: number;
  max_retries: number;
}

export interface OfflineServiceCallbacks {
  onOnline?: () => void;
  onOffline?: () => void;
  onSyncStart?: () => void;
  onSyncComplete?: (successCount: number, failedCount: number) => void;
  onMessageQueued?: (messageId: string) => void;
}

class OfflineService {
  private isOnline: boolean = true;
  private callbacks: OfflineServiceCallbacks = {};
  private syncInProgress: boolean = false;
  private unsubscribe?: () => void;

  /**
   * Initialize the offline service and start monitoring network
   */
  public async initialize(callbacks?: OfflineServiceCallbacks): Promise<void> {
    if (callbacks) {
      this.callbacks = callbacks;
    }

    // Get initial network state
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;

    // Subscribe to network state changes
    this.unsubscribe = NetInfo.addEventListener(this.handleNetworkChange);

    console.log('Offline service initialized. Online:', this.isOnline);
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange = async (state: NetInfoState): Promise<void> => {
    const wasOnline = this.isOnline;
    this.isOnline = state.isConnected ?? false;

    console.log('Network state changed. Online:', this.isOnline);

    if (!wasOnline && this.isOnline) {
      // Just came back online
      console.log('Connection restored. Syncing pending messages...');
      this.callbacks.onOnline?.();
      await this.syncPendingMessages();
    } else if (wasOnline && !this.isOnline) {
      // Just went offline
      console.log('Connection lost. Messages will be queued.');
      this.callbacks.onOffline?.();
    }
  };

  /**
   * Check if device is currently online
   */
  public getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Queue a voice message for later sending
   */
  public async queueMessage(
    patientId: string,
    message: string,
    conversationType: 'spontaneous' | 'reminder_response' | 'check_in' | 'emergency' = 'spontaneous'
  ): Promise<string> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const pendingMessage: PendingMessage = {
      id: messageId,
      patient_id: patientId,
      message,
      conversation_type: conversationType,
      timestamp: new Date(),
      retry_count: 0,
      max_retries: MAX_RETRIES,
    };

    try {
      // Get existing pending messages
      const pending = await this.getPendingMessages();

      // Add new message
      pending.push(pendingMessage);

      // Save to storage
      await AsyncStorage.setItem(PENDING_MESSAGES_KEY, JSON.stringify(pending));

      console.log(`Message queued: ${messageId}`);
      this.callbacks.onMessageQueued?.(messageId);

      return messageId;
    } catch (error) {
      console.error('Error queuing message:', error);
      throw error;
    }
  }

  /**
   * Get all pending messages
   */
  private async getPendingMessages(): Promise<PendingMessage[]> {
    try {
      const data = await AsyncStorage.getItem(PENDING_MESSAGES_KEY);
      if (data) {
        const messages = JSON.parse(data);
        // Convert timestamp strings back to Date objects
        return messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting pending messages:', error);
      return [];
    }
  }

  /**
   * Save pending messages to storage
   */
  private async savePendingMessages(messages: PendingMessage[]): Promise<void> {
    try {
      await AsyncStorage.setItem(PENDING_MESSAGES_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving pending messages:', error);
    }
  }

  /**
   * Sync all pending messages with the backend
   */
  public async syncPendingMessages(): Promise<{ success: number; failed: number }> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return { success: 0, failed: 0 };
    }

    if (!this.isOnline) {
      console.log('Device is offline. Cannot sync.');
      return { success: 0, failed: 0 };
    }

    this.syncInProgress = true;
    this.callbacks.onSyncStart?.();

    const pending = await this.getPendingMessages();
    if (pending.length === 0) {
      console.log('No pending messages to sync');
      this.syncInProgress = false;
      return { success: 0, failed: 0 };
    }

    console.log(`Syncing ${pending.length} pending messages...`);

    const results = {
      success: 0,
      failed: 0,
    };

    const remainingMessages: PendingMessage[] = [];

    for (const message of pending) {
      try {
        // Attempt to send message
        await apiService.sendVoiceMessage(
          message.patient_id,
          message.message,
          message.conversation_type
        );

        // Success!
        results.success++;
        console.log(`Message ${message.id} sent successfully`);
      } catch (error) {
        console.error(`Failed to send message ${message.id}:`, error);

        // Increment retry count
        message.retry_count++;

        // Check if we should retry
        if (message.retry_count < message.max_retries) {
          console.log(
            `Will retry message ${message.id} (${message.retry_count}/${message.max_retries})`
          );
          remainingMessages.push(message);
        } else {
          console.log(`Message ${message.id} exceeded max retries. Discarding.`);
          results.failed++;
        }
      }

      // Add small delay between requests to avoid overwhelming the backend
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Save remaining messages (those that need retry)
    await this.savePendingMessages(remainingMessages);

    console.log(
      `Sync complete. Success: ${results.success}, Failed: ${results.failed}, Remaining: ${remainingMessages.length}`
    );

    this.syncInProgress = false;
    this.callbacks.onSyncComplete?.(results.success, results.failed);

    return results;
  }

  /**
   * Get count of pending messages
   */
  public async getPendingCount(): Promise<number> {
    const pending = await this.getPendingMessages();
    return pending.length;
  }

  /**
   * Clear all pending messages (use with caution!)
   */
  public async clearPendingMessages(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PENDING_MESSAGES_KEY);
      console.log('All pending messages cleared');
    } catch (error) {
      console.error('Error clearing pending messages:', error);
    }
  }

  /**
   * Manually trigger a sync (useful for pull-to-refresh)
   */
  public async manualSync(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    return await this.syncPendingMessages();
  }

  /**
   * Clean up and unsubscribe from network events
   */
  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
    console.log('Offline service destroyed');
  }
}

// Export singleton instance
export const offlineService = new OfflineService();
