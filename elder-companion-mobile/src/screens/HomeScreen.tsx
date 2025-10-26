/**
 * Home Screen
 * Main screen with Talk button, next reminder, and emergency button
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { usePatientStore } from '../stores/patient.store';
import { apiService } from '../services/api.service';
import { ACTIVITY_TYPES } from '../config/constants';
import { Colors } from '../styles/colors';
import { Typography } from '../styles/typography';
import { Spacing, BorderRadius, Elevation } from '../styles/spacing';

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

  // Pulsing animation for "TALK TO ME" button
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Create pulsing animation (1.2s interval)
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    return () => {
      pulseAnimation.stop();
    };
  }, [pulseAnim]);

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
    navigation.navigate('VoiceChat', {});
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

      {/* Main Talk Button with pulsing animation - CIRCULAR */}
      <View style={styles.talkButtonContainer}>
        <Animated.View
          style={[
            styles.talkButtonAnimated,
            { transform: [{ scale: pulseAnim }] },
          ]}>
          <TouchableOpacity
            style={styles.talkButton}
            onPress={handleTalkPress}
            activeOpacity={0.8}>
            <Text style={styles.talkIcon}>🎤</Text>
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.talkButtonLabel}>TALK TO ME</Text>
      </View>

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
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  greeting: {
    ...Typography.h1,
    color: Colors.text,
  },
  settingsButton: {
    padding: Spacing.sm,
  },
  settingsIcon: {
    fontSize: 32,
  },
  reminderCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
    ...Elevation.medium,
  },
  reminderTitle: {
    ...Typography.overline,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  reminderIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  reminderText: {
    ...Typography.h3,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  reminderTime: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
  },
  reminderSubtext: {
    ...Typography.body,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  talkButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  talkButtonAnimated: {
    marginBottom: Spacing.md,
  },
  talkButton: {
    width: 160,
    height: 160,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  talkIcon: {
    fontSize: 64,
  },
  talkButtonLabel: {
    ...Typography.buttonLarge,
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  emergencyButton: {
    width: '100%',
    backgroundColor: Colors.emergency,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    shadowColor: Colors.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyIcon: {
    fontSize: 32,
    marginRight: Spacing.sm,
  },
  emergencyButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  statusBar: {
    paddingVertical: Spacing.sm,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
