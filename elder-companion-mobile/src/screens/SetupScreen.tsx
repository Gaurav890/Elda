/**
 * Setup Screen
 * QR code scanner for initial device setup
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  PermissionsAndroid,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RNCamera } from 'react-native-camera';
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
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef<RNCamera>(null);

  // Dev mode states
  const [showDevMode, setShowDevMode] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [setupToken, setSetupToken] = useState('');

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

  const handleStartScan = async () => {
    // RNCamera handles permissions automatically on iOS
    // Just activate the scanner
    setScannerActive(true);
  };

  const handleBarCodeScanned = ({ data, type }: any) => {
    if (loading || scanned) return;

    console.log('QR Code scanned:', data, 'Type:', type);
    setScanned(true);
    handleQRCodeScanned(data);
  };

  const handleCameraError = (error: any) => {
    console.error('Camera error:', error);
    Alert.alert(
      'Camera Error',
      'Unable to access camera. Please check permissions in Settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]
    );
    setScannerActive(false);
  };

  const handleCameraStatusChange = (status: any) => {
    console.log('Camera status:', status);
    if (status.cameraStatus === 'NOT_AUTHORIZED') {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera access in Settings to scan QR codes.',
        [
          { text: 'Cancel', style: 'cancel', onPress: () => setScannerActive(false) },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const handleManualSetup = async () => {
    if (!patientId || !setupToken) {
      Alert.alert('Missing Information', 'Please enter both Patient ID and Setup Token');
      return;
    }

    setShowDevMode(false);
    setLoading(true);

    try {
      // Create QR code data format
      const qrData = JSON.stringify({
        patient_id: patientId.trim(),
        setup_token: setupToken.trim(),
      });

      // Use existing QR code handler
      await handleQRCodeScanned(qrData);
    } catch (error) {
      setLoading(false);
      console.error('Manual setup error:', error);
      Alert.alert(
        'Setup Failed',
        error instanceof Error ? error.message : 'Please try again'
      );
    }
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

            {__DEV__ && (
              <TouchableOpacity
                style={[styles.scanButton, styles.devButton]}
                onPress={() => setShowDevMode(true)}>
                <Text style={styles.scanButtonText}>🛠️ Dev Mode (Manual Entry)</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {scannerActive && !loading && (
          <View style={styles.scannerContainer}>
            <Text style={styles.scannerInstructionText}>
              Point your camera at the QR code
            </Text>
            <RNCamera
              ref={cameraRef}
              style={styles.camera}
              type={RNCamera.Constants.Type.back}
              flashMode={RNCamera.Constants.FlashMode.auto}
              onBarCodeRead={handleBarCodeScanned}
              barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
              captureAudio={false}
              onStatusChange={handleCameraStatusChange}
              onMountError={handleCameraError}
              androidCameraPermissionOptions={{
                title: 'Camera Permission',
                message: 'Elder Companion needs camera access to scan QR codes',
                buttonPositive: 'OK',
                buttonNegative: 'Cancel',
              }}
            >
              <View style={styles.qrMarker} />
            </RNCamera>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setScannerActive(false);
                setScanned(false);
              }}>
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

      {/* Dev Mode Modal */}
      <Modal
        visible={showDevMode}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDevMode(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalContent}>
              <Text style={styles.modalTitle}>🛠️ Developer Mode</Text>
              <Text style={styles.modalSubtitle}>Manual Patient Setup</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Patient ID</Text>
                <TextInput
                  style={styles.input}
                  value={patientId}
                  onChangeText={setPatientId}
                  placeholder="Enter patient UUID"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Setup Token</Text>
                <TextInput
                  style={styles.input}
                  value={setupToken}
                  onChangeText={setSetupToken}
                  placeholder="Enter setup token"
                  placeholderTextColor="#9ca3af"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Text style={styles.helperText}>
                💡 Tip: Run get_patient_credentials.py in backend to get credentials
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={() => setShowDevMode(false)}>
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSubmitButton]}
                  onPress={handleManualSetup}>
                  <Text style={styles.modalSubmitButtonText}>Setup</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    height: 500,
    backgroundColor: '#000000',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginTop: 16,
    marginBottom: 16,
  },
  cancelButtonText: {
    fontSize: 18,
    color: '#1f2937',
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  qrMarker: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: '#2563eb',
    borderRadius: 12,
    backgroundColor: 'transparent',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -125,
    marginTop: -125,
  },
  camera: {
    height: 400,
    width: '100%',
  },
  scannerInstructionText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: '100%',
  },
  permissionDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#ffffff',
  },
  permissionDeniedText: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 26,
  },
  // Dev Mode Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalScroll: {
    maxHeight: '100%',
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f3f4f6',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalSubmitButton: {
    backgroundColor: '#10b981',
  },
  modalSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
