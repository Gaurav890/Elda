/**
 * Voice Chat Screen
 * Active conversation interface with AI
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { usePatientStore } from '../stores/patient.store';
import { useConversationStore } from '../stores/conversation.store';
import { apiService } from '../services/api.service';
import { voiceService } from '../services/voice.service';
import { ttsService } from '../services/tts.service';
import { Colors } from '../styles/colors';
import { Typography } from '../styles/typography';
import { Spacing, BorderRadius, Elevation } from '../styles/spacing';

type VoiceChatNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VoiceChat'
>;

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

export default function VoiceChatScreen() {
  const navigation = useNavigation<VoiceChatNavigationProp>();
  const { patientId } = usePatientStore();
  const {
    messages,
    addMessage,
    clearMessages,
  } = useConversationStore();

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const processingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs to track current values (avoid stale closures)
  const voiceStateRef = useRef<VoiceState>('idle');
  const transcribedTextRef = useRef<string>('');

  // Keep refs in sync with state
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    transcribedTextRef.current = transcribedText;
  }, [transcribedText]);

  // Waveform animation for listening state
  const waveAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Initialize voice service with callbacks
    voiceService.initialize({
      onStart: () => {
        console.log('Voice started');
        setVoiceState('listening');
      },
      onResult: (transcript) => {
        console.log('Transcript:', transcript);
        setTranscribedText(transcript);
      },
      onEnd: () => {
        console.log('🎤 Voice ended');
        console.log('Current state:', voiceStateRef.current);
        console.log('Current transcript:', transcribedTextRef.current);

        // Use refs to get current values (not stale closure values)
        // Accept both 'listening' and 'error' states (error happens on timeout)
        const hasTranscript = transcribedTextRef.current && transcribedTextRef.current.trim().length > 0;
        const isValidState = voiceStateRef.current === 'listening' || voiceStateRef.current === 'error';

        if (isValidState && hasTranscript) {
          console.log('✅ Auto-triggering voice input with:', transcribedTextRef.current);
          handleVoiceInput(transcribedTextRef.current);
        } else {
          console.log('❌ Not auto-triggering - state:', voiceStateRef.current, 'hasTranscript:', hasTranscript);
        }
      },
      onError: (error) => {
        console.error('Voice error:', error);
        setErrorMessage(error);
        setVoiceState('error');
        // Show error for 3 seconds, then go back to idle
        setTimeout(() => {
          setVoiceState('idle');
          setErrorMessage('');
        }, 3000);
      },
    });

    // Initialize TTS service with callbacks
    ttsService.setCallbacks({
      onStart: () => {
        console.log('TTS started');
        setVoiceState('speaking');
      },
      onFinish: () => {
        console.log('TTS finished');
        setVoiceState('idle');
      },
      onError: (error) => {
        console.error('TTS error:', error);
        setVoiceState('idle');
      },
    });

    // Auto-start listening when screen opens
    startListening();

    // Cleanup on unmount
    return () => {
      voiceService.cancelListening();
      ttsService.stop();
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current);
      }
    };
  }, []);

  // Waveform animation when listening
  useEffect(() => {
    let waveAnimation: Animated.CompositeAnimation | null = null;

    if (voiceState === 'listening') {
      waveAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      waveAnimation.start();
    }

    return () => {
      if (waveAnimation) {
        waveAnimation.stop();
      }
    };
  }, [voiceState, waveAnim]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const startListening = async () => {
    setTranscribedText('');
    setErrorMessage('');
    await voiceService.startListening();
  };

  const stopListening = async () => {
    await voiceService.stopListening();
  };

  const handleVoiceInput = async (text: string) => {
    if (!patientId || !text) return;

    // Stop listening
    await stopListening();

    // Add patient message
    addMessage(text, 'patient');
    setTranscribedText('');

    // Check if message contains reminder acknowledgment phrases
    const acknowledgmentPhrases = [
      'i took it',
      'took it',
      'i did it',
      'did it',
      'done',
      'completed',
      'finished',
      'yes i took',
      'already took',
      'just took',
    ];
    const lowerText = text.toLowerCase();
    const isAcknowledgment = acknowledgmentPhrases.some(phrase =>
      lowerText.includes(phrase),
    );

    // STEP 1: Show "Processing your message"
    console.log('🔄 Setting state to PROCESSING');
    setVoiceState('processing');
    setElapsedTime(0);

    // Start elapsed time counter
    processingTimerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 0.1);
    }, 100);

    try {
      // Send to backend
      const startTime = Date.now();
      console.log('📤 Sending voice message to backend:', text);

      // If acknowledgment detected, include flag in context
      const context = isAcknowledgment
        ? { potential_reminder_acknowledgment: true, patient_message: text }
        : undefined;

      // Add timeout indicator for long requests
      const timeoutId = setTimeout(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`⏱️ API call taking ${elapsed}s...`);
        // State will still show "Processing..." which is fine
      }, 5000);

      const response = await apiService.sendVoiceMessage(
        patientId,
        text,
        'spontaneous',
        context,
      );

      clearTimeout(timeoutId);

      // Stop timer
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current);
        processingTimerRef.current = null;
      }

      const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`✅ Received response from backend in ${totalTime}s`);

      // Add AI response
      addMessage(response.ai_response, 'ai');

      // STEP 2: Show "Preparing response" before TTS
      console.log('🔊 Setting state to SPEAKING');
      setVoiceState('speaking');

      // Small delay to show the speaking state
      await new Promise(resolve => setTimeout(resolve, 300));

      // Play TTS
      console.log('Playing TTS response:', response.ai_response);
      await ttsService.speak(response.ai_response);

      // Continue conversation if needed (default to false if not provided)
      const shouldContinue = response.continue_conversation || false;
      if (shouldContinue) {
        // Wait for TTS to finish, then restart listening
        // The TTS onFinish callback will set state to idle, then we can restart
        setTimeout(() => {
          if (voiceState === 'idle') {
            startListening();
          }
        }, 500);
      }
    } catch (error) {
      // Stop timer
      if (processingTimerRef.current) {
        clearInterval(processingTimerRef.current);
        processingTimerRef.current = null;
      }

      console.error('❌ Voice interaction error:', error);
      console.error('Error details:', JSON.stringify(error));
      const errorMsg = "I'm having trouble hearing you right now. Let's try again.";
      addMessage(errorMsg, 'ai');
      setVoiceState('speaking');
      await ttsService.speak(errorMsg);
    }
  };

  const handleMicPress = () => {
    if (voiceState === 'listening') {
      stopListening();
      setVoiceState('idle');
    } else if (voiceState === 'idle' || voiceState === 'error') {
      startListening();
    }
  };

  const handleTestVoice = () => {
    Alert.prompt(
      'Test Voice Input',
      'Enter a test message to simulate voice input:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send',
          onPress: (text) => {
            if (text && text.trim()) {
              handleVoiceInput(text.trim());
            }
          },
        },
      ],
      'plain-text',
      'Hello, how are you today?'
    );
  };

  const handleEndConversation = async () => {
    await voiceService.cancelListening();
    await ttsService.stop();
    clearMessages();
    navigation.goBack();
  };

  const renderVoiceIndicator = () => {
    switch (voiceState) {
      case 'listening':
        return (
          <View style={styles.listeningContainer}>
            <Animated.View
              style={[
                styles.waveform,
                { transform: [{ scale: waveAnim }] },
              ]}>
              <Text style={styles.listeningIcon}>🎤</Text>
            </Animated.View>
            <Text style={styles.listeningText}>👂 LISTENING NOW - Say something!</Text>
            {transcribedText && (
              <Text style={styles.transcribedText}>{transcribedText}</Text>
            )}
            <TouchableOpacity
              style={styles.doneButton}
              onPress={stopListening}>
              <Text style={styles.doneButtonText}>✓ Done Speaking</Text>
            </TouchableOpacity>
          </View>
        );

      case 'processing':
        return (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingText}>🤖 AI is thinking...</Text>
            <Text style={styles.processingTimeText}>
              {elapsedTime.toFixed(1)}s elapsed
            </Text>
            <Text style={styles.processingSubtext}>
              {elapsedTime < 5 ? 'Please wait...' : 'Taking a bit longer than usual...'}
            </Text>
          </View>
        );

      case 'speaking':
        return (
          <View style={styles.listeningContainer}>
            <Text style={styles.speakingIcon}>🔊</Text>
            <Text style={styles.speakingText}>Speaking...</Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.listeningContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        );

      default:
        return (
          <View style={styles.listeningContainer}>
            <Text style={styles.idleText}>Tap the mic to talk</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔥 UPDATED VERSION - Conversation</Text>
      </View>

      {/* Voice State Indicator */}
      {renderVoiceIndicator()}

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Start talking to begin the conversation
            </Text>
          </View>
        )}
        {messages.map(message => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.sender === 'patient'
                ? styles.patientMessage
                : styles.aiMessage,
            ]}>
            <Text
              style={[
                styles.messageText,
                message.sender === 'patient'
                  ? styles.patientText
                  : styles.aiText,
              ]}>
              {message.text}
            </Text>
            <Text
              style={[
                styles.messageTime,
                message.sender === 'patient'
                  ? styles.patientTimeText
                  : styles.aiTimeText,
              ]}>
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[
            styles.micButton,
            voiceState === 'listening' && styles.micButtonActive,
          ]}
          onPress={handleMicPress}
          disabled={voiceState === 'processing' || voiceState === 'speaking'}>
          <Text style={styles.micIcon}>
            {voiceState === 'listening' ? '⏸️' : '🎤'}
          </Text>
          <Text style={styles.micButtonText}>
            {voiceState === 'listening' ? 'Stop' : 'Talk'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.testButton]}
          onPress={handleTestVoice}
          disabled={voiceState === 'processing' || voiceState === 'speaking'}>
          <Text style={styles.buttonText}>🧪 Test</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.endButton]}
          onPress={handleEndConversation}>
          <Text style={styles.buttonText}>⏹️ End</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    ...Typography.h2,
    color: Colors.text,
  },
  listeningContainer: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  processingContainer: {
    padding: Spacing.xl,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  waveform: {
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningIcon: {
    fontSize: 48,
  },
  listeningText: {
    ...Typography.h3,
    color: Colors.listening,
    marginTop: Spacing.sm,
  },
  transcribedText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  processingText: {
    ...Typography.h2,
    color: Colors.primary,
    marginTop: Spacing.md,
    fontWeight: '700',
  },
  processingTimeText: {
    fontSize: 32,
    color: Colors.primary,
    marginTop: Spacing.sm,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  processingSubtext: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    fontWeight: '500',
  },
  speakingIcon: {
    fontSize: 48,
  },
  speakingText: {
    ...Typography.h3,
    color: Colors.speaking,
    marginTop: Spacing.sm,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  idleText: {
    ...Typography.bodyLarge,
    color: Colors.textTertiary,
  },
  doneButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Elevation.medium,
  },
  doneButtonText: {
    ...Typography.bodyLarge,
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 18,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyStateText: {
    ...Typography.body,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    ...Elevation.small,
  },
  patientMessage: {
    backgroundColor: Colors.primary,
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: Colors.background,
    alignSelf: 'flex-start',
  },
  messageText: {
    ...Typography.bodyLarge,
  },
  patientText: {
    color: Colors.textInverse,
  },
  aiText: {
    color: Colors.text,
  },
  messageTime: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  patientTimeText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  aiTimeText: {
    color: Colors.textTertiary,
  },
  actionContainer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  micButton: {
    flex: 2,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    ...Elevation.small,
  },
  micButtonActive: {
    backgroundColor: Colors.error,
  },
  micIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  micButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    ...Elevation.small,
  },
  testButton: {
    backgroundColor: Colors.success,
  },
  endButton: {
    backgroundColor: Colors.textSecondary,
  },
  buttonText: {
    ...Typography.buttonSmall,
    color: Colors.textInverse,
    fontWeight: '600',
  },
});
