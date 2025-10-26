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
  Vibration,
  Linking,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { usePatientStore } from '../stores/patient.store';
import { apiService } from '../services/api.service';
import { heartbeatService } from '../services/heartbeat.service';
import { localNotificationService } from '../services/local-notification.service';
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
  const [schedules, setSchedules] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acknowledgingReminders, setAcknowledgingReminders] = useState<Set<string>>(new Set());
  const [emergencyPressTime, setEmergencyPressTime] = useState<number | null>(null);

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

  // Initialize local notification service
  useEffect(() => {
    localNotificationService.initialize();
  }, []);

  // Fetch schedules and reminders on mount
  useEffect(() => {
    if (patientId) {
      fetchSchedules();
      fetchReminders();
    }
  }, [patientId]);

  // Auto-refresh reminders every 60 seconds
  useEffect(() => {
    if (!patientId) return;

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing reminders...');
      fetchReminders();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [patientId]);

  // Update "Next Reminder" section whenever reminders change
  useEffect(() => {
    if (reminders.length > 0) {
      // Sort by due_at to find earliest reminder
      const sorted = [...reminders].sort((a, b) =>
        new Date(a.due_at).getTime() - new Date(b.due_at).getTime()
      );

      const next = sorted[0];
      setNextReminder({
        title: next.title,
        time: new Date(next.due_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      });

      console.log('📍 Next reminder:', next.title, 'at', new Date(next.due_at).toLocaleTimeString());
    } else {
      setNextReminder(null);
      console.log('📍 No upcoming reminders');
    }
  }, [reminders]);

  // Schedule local notifications for all pending reminders
  useEffect(() => {
    // Use setTimeout to avoid setState during render warnings
    const scheduleLocalNotifications = async () => {
      if (reminders.length === 0) return;

      console.log(`📱 Scheduling ${reminders.length} local notifications...`);

      for (const reminder of reminders) {
        try {
          const dueTime = new Date(reminder.due_at);
          const now = new Date();

          // Only schedule if reminder is in the future
          if (dueTime > now) {
            // Schedule initial notification + 3 retry notifications (15, 20, 25 min later)
            await localNotificationService.scheduleReminderWithRetries({
              id: reminder.id,
              title: reminder.title || 'Reminder',
              body: reminder.message || reminder.description || '',
              scheduledTime: dueTime,
              reminderId: reminder.id,
              reminderType: reminder.type || 'other',
              speakText: reminder.message || reminder.title,
              requiresResponse: true,
            });

            console.log(`✅ Scheduled notification with retries for: ${reminder.title} at ${dueTime.toLocaleTimeString()}`);
          }
        } catch (error) {
          console.error(`❌ Error scheduling notification for ${reminder.title}:`, error);
        }
      }
    };

    // Delay scheduling to avoid render cycle conflicts
    const timeoutId = setTimeout(() => {
      scheduleLocalNotifications();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [reminders]);

  const fetchSchedules = async () => {
    if (!patientId) return;

    try {
      setLoadingSchedules(true);
      const data = await apiService.getPatientSchedules(patientId);
      console.log('Fetched schedules:', data);
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const fetchReminders = async () => {
    if (!patientId) return;

    try {
      setLoadingReminders(true);
      const data = await apiService.getUpcomingReminders(patientId);
      console.log('Fetched reminders:', data);
      // Filter for today's reminders that are pending
      const today = new Date();
      const todayReminders = data.filter((reminder: any) => {
        const reminderDate = new Date(reminder.due_at);
        return (
          reminderDate.toDateString() === today.toDateString() &&
          reminder.status === 'pending'
        );
      });
      setReminders(todayReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoadingReminders(false);
    }
  };

  const sendHeartbeat = async (activityType: string) => {
    if (!patientId) return;

    try {
      await apiService.sendHeartbeat(patientId, activityType);
    } catch (error) {
      console.error('Heartbeat error:', error);
    }
  };

  const formatTime = (timeString: string): string => {
    // Convert "08:00:00" to "8:00 AM"
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours, 10);
    const isPM = hour >= 12;
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${isPM ? 'PM' : 'AM'}`;
  };

  const getScheduleIcon = (type: string): string => {
    return type === 'medication' ? '💊' : '🍽️';
  };

  const handleTalkPress = () => {
    navigation.navigate('VoiceChat', {});
  };

  // Emergency button - press and hold for 2 seconds
  const handleEmergencyPressIn = () => {
    setEmergencyPressTime(Date.now());
    // Short vibration on press
    Vibration.vibrate(50);
  };

  const handleEmergencyPressOut = async () => {
    if (!emergencyPressTime) return;

    const pressDuration = Date.now() - emergencyPressTime;
    setEmergencyPressTime(null);

    // Require 2 seconds hold
    if (pressDuration < 2000) {
      Alert.alert(
        'Hold to Confirm',
        'Press and hold the emergency button for 2 seconds to send an alert.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Confirmation vibration pattern (long-short-long)
    Vibration.vibrate([0, 200, 100, 200]);

    // Show confirmation dialog
    Alert.alert(
      'Emergency Alert',
      'Send emergency alert to your caregiver?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Send emergency heartbeat using heartbeat service
              await heartbeatService.sendEmergencyAlert();

              // Success vibration
              Vibration.vibrate(500);

              Alert.alert(
                'Help is on the way! 🚨',
                'Your caregiver has been notified and will contact you soon.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Optionally call caregiver (implement when we have caregiver phone number)
                      // Linking.openURL('tel:+1234567890');
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Emergency alert error:', error);
              Alert.alert(
                'Error',
                'Could not send emergency alert. The alert will be sent when connection is restored.',
                [{ text: 'OK' }]
              );
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

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchSchedules(),
        fetchReminders(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAcknowledgeReminder = async (reminderId: string, title: string) => {
    // Prevent double-tap
    if (acknowledgingReminders.has(reminderId)) return;

    // Add to acknowledging set
    setAcknowledgingReminders(prev => new Set(prev).add(reminderId));

    try {
      // Call API to acknowledge reminder
      await apiService.acknowledgeReminder(reminderId, 'completed');

      // Cancel all local notifications for this reminder (including retries)
      await localNotificationService.cancelReminderNotifications(reminderId);
      console.log(`🔕 Cancelled all notifications (including retries) for: ${title}`);

      // Vibration feedback
      Vibration.vibrate(50);

      // Show success message
      Alert.alert('Completed!', `Marked "${title}" as completed.`, [{ text: 'OK' }]);

      // Refresh reminders list
      await fetchReminders();
    } catch (error) {
      console.error('Error acknowledging reminder:', error);
      Alert.alert('Error', 'Could not mark reminder as completed. Please try again.', [
        { text: 'OK' },
      ]);
    } finally {
      // Remove from acknowledging set
      setAcknowledgingReminders(prev => {
        const next = new Set(prev);
        next.delete(reminderId);
        return next;
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#2563eb']}
          tintColor="#2563eb"
        />
      }>
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

      {/* Emergency Button - Press and Hold for 2 seconds */}
      <TouchableOpacity
        style={[
          styles.emergencyButton,
          emergencyPressTime !== null && styles.emergencyButtonPressed,
        ]}
        onPressIn={handleEmergencyPressIn}
        onPressOut={handleEmergencyPressOut}
        disabled={loading}
        activeOpacity={0.8}>
        <Text style={styles.emergencyIcon}>🚨</Text>
        <Text style={styles.emergencyButtonText}>
          {emergencyPressTime !== null ? 'HOLD...' : 'I NEED HELP'}
        </Text>
      </TouchableOpacity>
      {emergencyPressTime !== null && (
        <Text style={styles.emergencyHint}>Keep holding...</Text>
      )}

      {/* Today's Reminders */}
      <View style={styles.scheduleContainer}>
        <Text style={styles.scheduleTitle}>TODAY'S REMINDERS</Text>
        {loadingReminders ? (
          <Text style={styles.scheduleText}>Loading...</Text>
        ) : reminders.length > 0 ? (
          reminders.map((reminder) => (
            <View key={reminder.id} style={styles.reminderItem}>
              <View style={styles.reminderItemContent}>
                <Text style={styles.reminderItemIcon}>💊</Text>
                <View style={styles.reminderItemDetails}>
                  <Text style={styles.reminderItemTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderItemTime}>
                    {new Date(reminder.due_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.checkmarkButton,
                  acknowledgingReminders.has(reminder.id) && styles.checkmarkButtonDisabled,
                ]}
                onPress={() => handleAcknowledgeReminder(reminder.id, reminder.title)}
                disabled={acknowledgingReminders.has(reminder.id)}>
                <Text style={styles.checkmarkIcon}>
                  {acknowledgingReminders.has(reminder.id) ? '⏳' : '✓'}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.noRemindersContainer}>
            <Text style={styles.noRemindersIcon}>✓</Text>
            <Text style={styles.noRemindersText}>No pending reminders</Text>
            <Text style={styles.noRemindersSubtext}>Great job!</Text>
          </View>
        )}
      </View>

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
    marginBottom: Spacing.sm,
    shadowColor: Colors.emergency,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emergencyButtonPressed: {
    backgroundColor: '#B71C1C', // Darker red when pressed
    transform: [{ scale: 0.98 }],
  },
  emergencyIcon: {
    fontSize: 32,
    marginRight: Spacing.sm,
  },
  emergencyButtonText: {
    ...Typography.button,
    color: Colors.textInverse,
  },
  emergencyHint: {
    ...Typography.caption,
    color: Colors.emergency,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontWeight: '600',
  },
  statusBar: {
    paddingVertical: Spacing.sm,
  },
  statusText: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  scheduleContainer: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Elevation.medium,
  },
  scheduleTitle: {
    ...Typography.overline,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  scheduleText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scheduleIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  scheduleDetails: {
    flex: 1,
  },
  scheduleItemTitle: {
    ...Typography.bodyLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  scheduleItemMed: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scheduleTime: {
    ...Typography.body,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  reminderItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderItemIcon: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  reminderItemDetails: {
    flex: 1,
  },
  reminderItemTitle: {
    ...Typography.bodyLarge,
    color: Colors.text,
    fontWeight: '600',
  },
  reminderItemTime: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkmarkButton: {
    width: 56,
    height: 56,
    backgroundColor: Colors.success,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.md,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  checkmarkButtonDisabled: {
    backgroundColor: Colors.textTertiary,
    opacity: 0.5,
  },
  checkmarkIcon: {
    fontSize: 32,
    color: Colors.textInverse,
  },
  noRemindersContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noRemindersIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  noRemindersText: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  noRemindersSubtext: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
});
