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
    const initializeApp = async () => {
      try {
        // Load settings first
        await loadSettings();

        // Then initialize push notifications (non-blocking)
        setTimeout(() => {
          notificationService.initialize().catch((error) => {
            console.error('Failed to initialize notification service:', error);
          });
        }, 1000);
      } catch (error) {
        console.error('App initialization error:', error);
      }
    };

    initializeApp();
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
