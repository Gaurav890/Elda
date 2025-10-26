/**
 * Elder Companion Mobile App
 * Main App Component
 */

import React, { useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useSettingsStore } from './src/stores/settings.store';
import { notificationService } from './src/services/notification.service';

function App(): JSX.Element {
  const { loadSettings } = useSettingsStore();

  // Load settings and initialize notification service on app start
  useEffect(() => {
    loadSettings();

    // Initialize push notifications
    notificationService.initialize().catch((error) => {
      console.error('Failed to initialize notification service:', error);
    });
  }, [loadSettings]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <AppNavigator />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
