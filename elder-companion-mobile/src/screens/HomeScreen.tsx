/**
 * Home Screen
 * Main screen with Talk button, next reminder, and emergency button
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { usePatientStore } from '../stores/patient.store';
import { apiService } from '../services/api.service';
import { ACTIVITY_TYPES } from '../config/constants';

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Home'
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { patientId, patientName, preferredName } = usePatientStore();
  const [nextReminder, setNextReminder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const displayName = preferredName || patientName || 'there';

  // Send app_open heartbeat on mount
  useEffect(() => {
    sendHeartbeat('app_open');
    return () => {
      sendHeartbeat('app_close');
    };
  }, []);

  const sendHeartbeat = async (activityType: string) => {
    if (!patientId) return;

    try {
      await apiService.sendHeartbeat(patientId, activityType);
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  };

  const handleTalkPress = () => {
    navigation.navigate('VoiceChat');
  };

  const handleEmergencyPress = () => {
    Alert.alert(
      'Emergency Help',
      'Are you sure you need emergency assistance?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, I Need Help',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              if (patientId) {
                // Send emergency heartbeat
                await apiService.sendHeartbeat(
                  patientId,
                  ACTIVITY_TYPES.EMERGENCY,
                );

                Alert.alert(
                  'Help is on the way',
                  'Your caregiver has been notified.',
                );
              }
            } catch (error) {
              Alert.alert('Error', 'Could not send emergency alert');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi {displayName}! 😊</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettingsPress}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Next Reminder Card */}
      <View style={styles.reminderCard}>
        <Text style={styles.reminderTitle}>NEXT REMINDER</Text>
        {nextReminder ? (
          <>
            <Text style={styles.reminderIcon}>💊</Text>
            <Text style={styles.reminderText}>{nextReminder.title}</Text>
            <Text style={styles.reminderTime}>{nextReminder.time}</Text>
          </>
        ) : (
          <>
            <Text style={styles.reminderIcon}>✓</Text>
            <Text style={styles.reminderText}>No upcoming reminders</Text>
            <Text style={styles.reminderSubtext}>Enjoy your day!</Text>
          </>
        )}
      </View>

      {/* Main Talk Button */}
      <TouchableOpacity
        style={styles.talkButton}
        onPress={handleTalkPress}
        activeOpacity={0.8}>
        <Text style={styles.talkIcon}>🎤</Text>
        <Text style={styles.talkButtonText}>TALK TO ME</Text>
      </TouchableOpacity>

      {/* Emergency Button */}
      <TouchableOpacity
        style={styles.emergencyButton}
        onPress={handleEmergencyPress}
        disabled={loading}
        activeOpacity={0.8}>
        <Text style={styles.emergencyIcon}>🚨</Text>
        <Text style={styles.emergencyButtonText}>I NEED HELP</Text>
      </TouchableOpacity>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>
          App is running • {patientId ? 'Connected' : 'Setup needed'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 32,
  },
  reminderCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 16,
  },
  reminderIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  reminderText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  reminderTime: {
    fontSize: 18,
    color: '#6b7280',
  },
  reminderSubtext: {
    fontSize: 16,
    color: '#9ca3af',
    marginTop: 4,
  },
  talkButton: {
    width: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 24,
    paddingVertical: 36,
    paddingHorizontal: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  talkIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  talkButtonText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  emergencyButton: {
    width: '100%',
    backgroundColor: '#dc2626',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  emergencyButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statusBar: {
    paddingVertical: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
