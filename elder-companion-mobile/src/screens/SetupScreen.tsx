/**
 * Setup Screen
 * QR code scanner for initial device setup
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { apiService } from '../services/api.service';
import { storageService } from '../services/storage.service';
import { usePatientStore } from '../stores/patient.store';

type SetupScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Setup'
>;

export default function SetupScreen() {
  const navigation = useNavigation<SetupScreenNavigationProp>();
  const { setPatientData } = usePatientStore();
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);

  const handleQRCodeScanned = async (data: string) => {
    if (loading) return;

    setScannerActive(false);
    setLoading(true);

    try {
      // Parse QR code data
      const qrData = JSON.parse(data);
      const { patient_id, setup_token } = qrData;

      if (!patient_id || !setup_token) {
        throw new Error('Invalid QR code');
      }

      // Step 1: Verify setup token with backend
      const setupResponse = await apiService.setupDevice(
        patient_id,
        setup_token,
      );

      if (!setupResponse.success) {
        throw new Error('Setup verification failed');
      }

      // Step 2: Store patient ID locally
      await storageService.setPatientId(patient_id);

      // Step 3: Update global state
      setPatientData(
        patient_id,
        setupResponse.patient_name,
        setupResponse.preferred_name,
      );

      // Step 4: Register device token (will be done in Home screen)
      // For now, just show success and navigate

      Alert.alert(
        'Setup Complete!',
        `Welcome ${setupResponse.preferred_name || setupResponse.patient_name}!`,
        [
          {
            text: 'Get Started',
            onPress: () => {
              // Navigation will happen automatically when isSetupComplete becomes true
            },
          },
        ],
      );
    } catch (error) {
      console.error('Setup error:', error);
      Alert.alert(
        'Setup Failed',
        error instanceof Error ? error.message : 'Please try again',
        [
          {
            text: 'Retry',
            onPress: () => setScannerActive(true),
          },
        ],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartScan = () => {
    setScannerActive(true);
    // In a real implementation, this would open the camera
    // For now, we'll simulate it with a test button
  };

  // Simulate QR scan for development
  const simulateQRScan = () => {
    const testQRData = {
      patient_id: '0a25b63d-eb49-4ba5-b2fa-9f1594162a7a',
      setup_token: 'test_token_for_development',
    };
    handleQRCodeScanned(JSON.stringify(testQRData));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>👴🏻</Text>
        <Text style={styles.title}>Elder Companion</Text>
        <Text style={styles.subtitle}>Voice-Enabled Care</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          To get started, scan the QR code provided by your caregiver
        </Text>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Setting up your device...</Text>
          </View>
        )}

        {!loading && !scannerActive && (
          <>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleStartScan}>
              <Text style={styles.scanButtonText}>📷 Scan QR Code</Text>
            </TouchableOpacity>

            {/* Development-only button */}
            {__DEV__ && (
              <TouchableOpacity
                style={[styles.scanButton, styles.devButton]}
                onPress={simulateQRScan}>
                <Text style={styles.scanButtonText}>🧪 Simulate QR Scan (Dev)</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {scannerActive && !loading && (
          <View style={styles.scannerContainer}>
            <Text style={styles.scannerText}>
              📸 Camera scanner would open here
            </Text>
            <Text style={styles.scannerSubtext}>
              Point camera at QR code to scan
            </Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setScannerActive(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Need help? Contact your caregiver
        </Text>
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
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 20,
    textAlign: 'center',
    color: '#4b5563',
    marginBottom: 48,
    lineHeight: 28,
  },
  scanButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 20,
    paddingHorizontal: 48,
    borderRadius: 16,
    marginBottom: 16,
    minWidth: 280,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
  },
  devButton: {
    backgroundColor: '#10b981',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6b7280',
  },
  scannerContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  scannerText: {
    fontSize: 24,
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  scannerSubtext: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'center',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#4b5563',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#9ca3af',
  },
});
