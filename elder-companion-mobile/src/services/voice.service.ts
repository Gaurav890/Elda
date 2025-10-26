import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
  SpeechVolumeChangeEvent,
} from '@react-native-voice/voice';
import { Platform, PermissionsAndroid } from 'react-native';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

export interface VoiceServiceCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
  onVolumeChange?: (volume: number) => void;
}

class VoiceService {
  private isListening: boolean = false;
  private currentTranscript: string = '';
  private timeoutId?: NodeJS.Timeout;
  private callbacks: VoiceServiceCallbacks = {};

  constructor() {
    // Bind event handlers
    Voice.onSpeechStart = this.handleSpeechStart;
    Voice.onSpeechEnd = this.handleSpeechEnd;
    Voice.onSpeechResults = this.handleSpeechResults;
    Voice.onSpeechError = this.handleSpeechError;
    Voice.onSpeechVolumeChanged = this.handleVolumeChange;
  }

  /**
   * Request microphone permission (Android only)
   */
  private async requestMicrophonePermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Elder Companion needs access to your microphone to have voice conversations',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Error requesting microphone permission:', err);
        return false;
      }
    }
    // iOS permissions are handled via Info.plist
    return true;
  }

  /**
   * Initialize the voice service with callbacks
   */
  public initialize(callbacks: VoiceServiceCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Start listening for speech
   */
  public async startListening(): Promise<void> {
    if (this.isListening) {
      console.warn('Already listening');
      return;
    }

    try {
      // Request permission first
      const hasPermission = await this.requestMicrophonePermission();
      if (!hasPermission) {
        this.callbacks.onError?.('Microphone permission denied');
        return;
      }

      // Reset state
      this.currentTranscript = '';
      this.isListening = true;

      // Start voice recognition
      await Voice.start('en-US');

      // Set 30-second timeout
      this.timeoutId = setTimeout(() => {
        this.stopListening();
        this.callbacks.onError?.('Speech recognition timeout (30 seconds)');
      }, 30000);

      console.log('Voice recognition started');
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      this.isListening = false;
      this.callbacks.onError?.('Failed to start voice recognition');
    }
  }

  /**
   * Stop listening for speech
   */
  public async stopListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    try {
      // Clear timeout
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
      }

      await Voice.stop();
      this.isListening = false;
      console.log('Voice recognition stopped');
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  }

  /**
   * Cancel listening (cleans up without triggering callbacks)
   */
  public async cancelListening(): Promise<void> {
    try {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
      }

      await Voice.cancel();
      this.isListening = false;
      this.currentTranscript = '';
      console.log('Voice recognition cancelled');
    } catch (error) {
      console.error('Error cancelling voice recognition:', error);
    }
  }

  /**
   * Destroy the voice service and clean up resources
   */
  public async destroy(): Promise<void> {
    try {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
        this.timeoutId = undefined;
      }

      await Voice.destroy();
      this.isListening = false;
      this.currentTranscript = '';

      // Remove event handlers (use no-op functions)
      Voice.onSpeechStart = () => {};
      Voice.onSpeechEnd = () => {};
      Voice.onSpeechResults = () => {};
      Voice.onSpeechError = () => {};
      Voice.onSpeechVolumeChanged = () => {};

      console.log('Voice service destroyed');
    } catch (error) {
      console.error('Error destroying voice service:', error);
    }
  }

  /**
   * Check if currently listening
   */
  public getIsListening(): boolean {
    return this.isListening;
  }

  /**
   * Get the current transcript
   */
  public getCurrentTranscript(): string {
    return this.currentTranscript;
  }

  /**
   * Handle speech start event
   */
  private handleSpeechStart = (e: SpeechStartEvent): void => {
    console.log('Speech started', e);
    this.callbacks.onStart?.();
  };

  /**
   * Handle speech end event
   */
  private handleSpeechEnd = (e: SpeechEndEvent): void => {
    console.log('Speech ended', e);
    this.isListening = false;

    // Clear timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    this.callbacks.onEnd?.();
  };

  /**
   * Handle speech results
   */
  private handleSpeechResults = (e: SpeechResultsEvent): void => {
    console.log('Speech results:', e.value);

    if (e.value && e.value.length > 0) {
      // Get the most accurate transcript (usually the first one)
      this.currentTranscript = e.value[0];
      this.callbacks.onResult?.(this.currentTranscript);
    }
  };

  /**
   * Handle speech recognition errors
   */
  private handleSpeechError = (e: SpeechErrorEvent): void => {
    console.error('Speech error:', e.error);
    this.isListening = false;

    // Clear timeout
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    // Map error codes to user-friendly messages
    let errorMessage = 'Speech recognition error';

    if (e.error?.code) {
      switch (e.error.code) {
        case '7': // No match
          errorMessage = "I didn't catch that. Please try again.";
          break;
        case '6': // Speech timeout
          errorMessage = "I didn't hear anything. Please try again.";
          break;
        case '5': // Client error
          errorMessage = 'Microphone error. Please check your permissions.';
          break;
        case '9': // Insufficient permissions
          errorMessage = 'Microphone permission is required for voice conversations.';
          break;
        case '1110': // No speech detected (common in simulator)
          errorMessage = 'No speech detected. Note: Voice recognition may not work in iOS Simulator. Please test on a real device.';
          break;
        default:
          // Check if running in simulator
          if (e.error.message?.includes('1110') || e.error.message?.includes('No speech')) {
            errorMessage = 'No speech detected. Voice recognition works best on real devices.';
          } else {
            errorMessage = `Speech recognition error: ${e.error.message || e.error.code}`;
          }
      }
    }

    this.callbacks.onError?.(errorMessage);
  };

  /**
   * Handle volume change during speech
   */
  private handleVolumeChange = (e: SpeechVolumeChangeEvent): void => {
    if (e.value !== undefined) {
      this.callbacks.onVolumeChange?.(e.value);
    }
  };
}

// Export singleton instance
export const voiceService = new VoiceService();
