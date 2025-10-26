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
  const scrollViewRef = useRef<ScrollView>(null);

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
        console.log('Voice ended');
        if (voiceState === 'listening' && transcribedText) {
          handleVoiceInput(transcribedText);
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
    setVoiceState('processing');

    try {
      // Send to backend
      const response = await apiService.sendVoiceMessage(
        patientId,
        text,
        'spontaneous',
      );

      // Add AI response
      addMessage(response.ai_response, 'ai');

      // Play TTS
      await ttsService.speak(response.ai_response);

      // Continue conversation if needed
      if (response.continue_conversation) {
        // Wait for TTS to finish, then restart listening
        // The TTS onFinish callback will set state to idle, then we can restart
        setTimeout(() => {
          if (voiceState === 'idle') {
            startListening();
          }
        }, 500);
      }
    } catch (error) {
      console.error('Voice interaction error:', error);
      const errorMsg = "I'm having trouble hearing you right now. Let's try again.";
      addMessage(errorMsg, 'ai');
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
            <Text style={styles.listeningText}>Listening...</Text>
            {transcribedText && (
              <Text style={styles.transcribedText}>{transcribedText}</Text>
            )}
          </View>
        );

      case 'processing':
        return (
          <View style={styles.listeningContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.processingText}>Processing...</Text>
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
        <Text style={styles.headerTitle}>💬 Conversation</Text>
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
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
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
