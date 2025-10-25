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
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 18,
    color: '#2563eb',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    padding: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#4b5563',
  },
  settingValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563eb',
  },
  settingDescription: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  testButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  resetButtonText: {
    fontSize: 18,
    color: '#dc2626',
    fontWeight: '600',
  },
  resetDescription: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
});
