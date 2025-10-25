/**
 * Voice Chat Screen
 * Active conversation interface with AI
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { usePatientStore } from '../stores/patient.store';
import { useConversationStore } from '../stores/conversation.store';
import { apiService } from '../services/api.service';

type VoiceChatNavigationProp = StackNavigationProp<
  RootStackParamList,
  'VoiceChat'
>;

export default function VoiceChatScreen() {
  const navigation = useNavigation<VoiceChatNavigationProp>();
  const { patientId } = usePatientStore();
  const {
    messages,
    isListening,
    transcribedText,
    addMessage,
    clearMessages,
    setListening,
    setTranscribedText,
  } = useConversationStore();

  const [processing, setProcessing] = useState(false);

  // Auto-start listening when screen opens
  useEffect(() => {
    startListening();
    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    setListening(true);
    // In real implementation, start voice recognition here
    // For now, simulate with a placeholder
  };

  const stopListening = () => {
    setListening(false);
    // In real implementation, stop voice recognition here
  };

  const handleVoiceInput = async (text: string) => {
    if (!patientId || !text) return;

    // Add patient message
    addMessage(text, 'patient');
    setTranscribedText('');
    setProcessing(true);

    try {
      // Send to backend
      const response = await apiService.sendVoiceMessage(
        patientId,
        text,
        'spontaneous',
      );

      // Add AI response
      addMessage(response.ai_response, 'ai');

      // In real implementation, play TTS here
      // await playTTS(response.ai_response);

      // Continue conversation if needed
      if (response.continue_conversation) {
        setTimeout(() => startListening(), 1000);
      }
    } catch (error) {
      console.error('Voice interaction error:', error);
      addMessage(
        "I'm having trouble hearing you right now. Let's try again.",
        'ai',
      );
    } finally {
      setProcessing(false);
    }
  };

  const simulateVoiceInput = () => {
    const testMessage = "Hello, I'm feeling good today!";
    setTranscribedText(testMessage);
    handleVoiceInput(testMessage);
  };

  const handleEndConversation = () => {
    clearMessages();
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Conversation</Text>
      </View>

      {/* Listening Indicator */}
      <View style={styles.listeningContainer}>
        {isListening && !processing && (
          <>
            <View style={styles.waveform}>
              <Text style={styles.listeningText}>🎤 Listening...</Text>
            </View>
            {transcribedText && (
              <Text style={styles.transcribedText}>{transcribedText}</Text>
            )}
          </>
        )}
        {processing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.processingText}>Processing...</Text>
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView
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
        {__DEV__ && (
          <TouchableOpacity
            style={[styles.button, styles.testButton]}
            onPress={simulateVoiceInput}>
            <Text style={styles.buttonText}>🧪 Simulate Voice</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, styles.endButton]}
          onPress={handleEndConversation}>
          <Text style={styles.buttonText}>⏹️ End Conversation</Text>
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
  },
  waveform: {
    padding: 16,
  },
  listeningText: {
    fontSize: 20,
    color: '#2563eb',
    fontWeight: '600',
  },
  transcribedText: {
    fontSize: 16,
    color: '#4b5563',
    marginTop: 8,
    textAlign: 'center',
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  processingText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
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
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  testButton: {
    backgroundColor: '#10b981',
  },
  endButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});
