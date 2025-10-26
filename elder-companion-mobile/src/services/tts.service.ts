import Tts from 'react-native-tts';

export interface TTSOptions {
  speed?: number; // 0.7-1.0 for elderly (default: 0.9)
  pitch?: number; // 0.5-2.0 (default: 1.0)
  language?: string; // 'en-US' (default)
}

export interface TTSCallbacks {
  onStart?: () => void;
  onFinish?: () => void;
  onCancel?: () => void;
  onError?: (error: string) => void;
}

interface QueuedMessage {
  id: string;
  text: string;
  options: TTSOptions;
}

class TTSService {
  private isSpeaking: boolean = false;
  private messageQueue: QueuedMessage[] = [];
  private currentMessageId?: string;
  private callbacks: TTSCallbacks = {};
  private defaultOptions: TTSOptions = {
    speed: 0.9, // Slower speed for elderly users
    pitch: 1.0,
    language: 'en-US',
  };

  constructor() {
    this.initializeTTS();
  }

  /**
   * Initialize TTS engine and set up event listeners
   */
  private async initializeTTS(): Promise<void> {
    try {
      // Set default speech rate (0.9 for elderly users)
      await Tts.setDefaultRate(this.defaultOptions.speed || 0.9);

      // Set default pitch
      await Tts.setDefaultPitch(this.defaultOptions.pitch || 1.0);

      // Set default language
      await Tts.setDefaultLanguage(this.defaultOptions.language || 'en-US');

      // Ignore silence switch (play even when phone is on silent) - iOS only
      if (require('react-native').Platform.OS === 'ios') {
        await (Tts as any).setIgnoreSilentSwitch('ignore');
      }

      // Set up event listeners
      Tts.addEventListener('tts-start', this.handleTTSStart);
      Tts.addEventListener('tts-finish', this.handleTTSFinish);
      Tts.addEventListener('tts-cancel', this.handleTTSCancel);

      console.log('TTS service initialized');
    } catch (error) {
      console.error('Error initializing TTS:', error);
    }
  }

  /**
   * Set callbacks for TTS events
   */
  public setCallbacks(callbacks: TTSCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Update default TTS options
   */
  public setDefaultOptions(options: Partial<TTSOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };

    // Apply changes immediately
    if (options.speed !== undefined) {
      Tts.setDefaultRate(options.speed);
    }
    if (options.pitch !== undefined) {
      Tts.setDefaultPitch(options.pitch);
    }
    if (options.language !== undefined) {
      Tts.setDefaultLanguage(options.language);
    }
  }

  /**
   * Speak text with optional options
   */
  public async speak(text: string, options?: TTSOptions): Promise<void> {
    if (!text || text.trim().length === 0) {
      console.warn('Cannot speak empty text');
      return;
    }

    const messageId = Date.now().toString();
    const messageOptions = { ...this.defaultOptions, ...options };

    // Add to queue
    this.messageQueue.push({
      id: messageId,
      text: text.trim(),
      options: messageOptions,
    });

    console.log(`Added message to queue: "${text.substring(0, 50)}..."`);

    // Process queue if not already speaking
    if (!this.isSpeaking) {
      await this.processQueue();
    }
  }

  /**
   * Process the message queue
   */
  private async processQueue(): Promise<void> {
    if (this.messageQueue.length === 0 || this.isSpeaking) {
      return;
    }

    const message = this.messageQueue.shift();
    if (!message) {
      return;
    }

    try {
      this.isSpeaking = true;
      this.currentMessageId = message.id;

      // Set options for this message
      if (message.options.speed !== undefined) {
        await Tts.setDefaultRate(message.options.speed);
      }
      if (message.options.pitch !== undefined) {
        await Tts.setDefaultPitch(message.options.pitch);
      }

      // Speak the message
      await Tts.speak(message.text);
      console.log(`Speaking: "${message.text.substring(0, 50)}..."`);
    } catch (error) {
      console.error('Error speaking message:', error);
      this.isSpeaking = false;
      this.currentMessageId = undefined;
      this.callbacks.onError?.(`Failed to speak: ${error}`);

      // Continue with next message in queue
      await this.processQueue();
    }
  }

  /**
   * Stop current speech and clear queue
   */
  public async stop(): Promise<void> {
    try {
      await Tts.stop();
      this.messageQueue = [];
      this.isSpeaking = false;
      this.currentMessageId = undefined;
      console.log('TTS stopped and queue cleared');
    } catch (error) {
      console.error('Error stopping TTS:', error);
    }
  }

  /**
   * Pause current speech
   */
  public async pause(): Promise<void> {
    try {
      await Tts.stop(); // react-native-tts doesn't have pause, so we use stop
      this.isSpeaking = false;
      console.log('TTS paused');
    } catch (error) {
      console.error('Error pausing TTS:', error);
    }
  }

  /**
   * Resume speaking (processes next item in queue)
   */
  public async resume(): Promise<void> {
    if (!this.isSpeaking && this.messageQueue.length > 0) {
      await this.processQueue();
    }
  }

  /**
   * Check if TTS is currently speaking
   */
  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  /**
   * Get the number of messages in the queue
   */
  public getQueueLength(): number {
    return this.messageQueue.length;
  }

  /**
   * Get available voices
   */
  public async getVoices(): Promise<any[]> {
    try {
      const voices = await Tts.voices();
      console.log('Available voices:', voices);
      return voices;
    } catch (error) {
      console.error('Error getting voices:', error);
      return [];
    }
  }

  /**
   * Set voice by language or voice ID
   */
  public async setVoice(voiceId: string): Promise<void> {
    try {
      await Tts.setDefaultVoice(voiceId);
      console.log(`Voice set to: ${voiceId}`);
    } catch (error) {
      console.error('Error setting voice:', error);
    }
  }

  /**
   * Clean up TTS service
   */
  public async destroy(): Promise<void> {
    try {
      // Stop any ongoing speech
      await this.stop();

      // Remove event listeners
      Tts.removeEventListener('tts-start', this.handleTTSStart);
      Tts.removeEventListener('tts-finish', this.handleTTSFinish);
      Tts.removeEventListener('tts-cancel', this.handleTTSCancel);

      console.log('TTS service destroyed');
    } catch (error) {
      console.error('Error destroying TTS service:', error);
    }
  }

  /**
   * Handle TTS start event
   */
  private handleTTSStart = (event: any): void => {
    console.log('TTS started:', event);
    this.isSpeaking = true;
    this.callbacks.onStart?.();
  };

  /**
   * Handle TTS finish event
   */
  private handleTTSFinish = async (event: any): Promise<void> => {
    console.log('TTS finished:', event);
    this.isSpeaking = false;
    this.currentMessageId = undefined;

    // Call finish callback
    this.callbacks.onFinish?.();

    // Process next message in queue
    if (this.messageQueue.length > 0) {
      await this.processQueue();
    }
  };

  /**
   * Handle TTS cancel event
   */
  private handleTTSCancel = (event: any): void => {
    console.log('TTS cancelled:', event);
    this.isSpeaking = false;
    this.currentMessageId = undefined;
    this.callbacks.onCancel?.();
  };
}

// Export singleton instance
export const ttsService = new TTSService();
