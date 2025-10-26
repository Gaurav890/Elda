/**
 * Settings Screen
 * App settings and preferences for patients
 */

import React from 'react';
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
import { useSettingsStore } from '../stores/settings.store';
import { APP_CONFIG } from '../config/constants';
import { Colors } from '../styles/colors';
import { Typography } from '../styles/typography';
import { Spacing, BorderRadius, Elevation } from '../styles/spacing';

type SettingsNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Settings'
>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const { patientId, clearPatientData } = usePatientStore();
  const { volume, ttsRate } = useSettingsStore();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleResetDevice = () => {
    Alert.alert(
      'Reset Device',
      'This will clear all data and you will need to scan the QR code again. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearPatientData();
            // Navigation will automatically redirect to Setup screen
          },
        },
      ],
    );
  };

  const handleTestVoice = () => {
    Alert.alert('Test Voice', 'This is a test of the text-to-speech system.');
    // In real implementation, play TTS sample
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings ⚙️</Text>
      </View>

      <View style={styles.content}>
        {/* Volume Setting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Volume</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Speaker Volume</Text>
            <Text style={styles.settingValue}>{Math.round(volume * 100)}%</Text>
          </View>
          <Text style={styles.settingDescription}>
            Adjust volume on your device
          </Text>
        </View>

        {/* Voice Speed Setting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voice Speed</Text>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Speech Rate</Text>
            <Text style={styles.settingValue}>
              {ttsRate < 1 ? 'Slower' : ttsRate > 1 ? 'Faster' : 'Normal'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestVoice}>
            <Text style={styles.testButtonText}>▶️ Play Sample</Text>
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>{APP_CONFIG.APP_VERSION}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Patient ID</Text>
            <Text style={styles.infoValue}>
              ****{patientId?.slice(-4) || '----'}
            </Text>
          </View>
        </View>

        {/* Reset Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Management</Text>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetDevice}>
            <Text style={styles.resetButtonText}>🔗 Re-scan QR Code</Text>
          </TouchableOpacity>
          <Text style={styles.resetDescription}>
            Use this to reset and setup the device again
          </Text>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <Text style={styles.helpText}>
            Need help? Contact your caregiver or family member.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginBottom: Spacing.md,
  },
  backText: {
    ...Typography.bodyLarge,
    color: Colors.primary,
  },
  title: {
    ...Typography.h1,
    color: Colors.text,
  },
  content: {
    padding: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...Elevation.small,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  settingLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  settingValue: {
    ...Typography.bodyLarge,
    color: Colors.primary,
    fontWeight: '600',
  },
  settingDescription: {
    ...Typography.caption,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  testButton: {
    backgroundColor: Colors.background,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  testButtonText: {
    ...Typography.button,
    color: Colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  resetButtonText: {
    ...Typography.button,
    color: Colors.error,
  },
  resetDescription: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
  helpText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
