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
            <ActivityIndicator size="large" color="#2563eb" />
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
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  listeningContainer: {
    padding: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  waveform: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningIcon: {
    fontSize: 48,
  },
  listeningText: {
    fontSize: 20,
    color: '#2563eb',
    fontWeight: '600',
    marginTop: 8,
  },
  transcribedText: {
    fontSize: 16,
    color: '#4b5563',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  processingText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 12,
    fontWeight: '500',
  },
  speakingIcon: {
    fontSize: 48,
  },
  speakingText: {
    fontSize: 20,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 8,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  idleText: {
    fontSize: 18,
    color: '#9ca3af',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  patientMessage: {
    backgroundColor: '#2563eb',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 18,
    lineHeight: 24,
  },
  patientText: {
    color: '#ffffff',
  },
  aiText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  patientTimeText: {
    color: '#dbeafe',
  },
  aiTimeText: {
    color: '#9ca3af',
  },
  actionContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 8,
  },
  micButton: {
    flex: 2,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  micButtonActive: {
    backgroundColor: '#dc2626',
  },
  micIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  micButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#10b981',
  },
  endButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
