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
import { heartbeatService } from './src/services/heartbeat.service';

function App(): JSX.Element {
  const { loadSettings } = useSettingsStore();

  // Load settings and initialize services on app start
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('[App] Initializing...');

        // Load settings first
        await loadSettings();

        // Initialize push notifications (non-blocking)
        setTimeout(() => {
          notificationService.initialize().catch((error) => {
            console.error('[App] Failed to initialize notification service:', error);
          });
        }, 1000);

        // Initialize heartbeat service (background tasks)
        setTimeout(() => {
          heartbeatService.initialize().catch((error) => {
            console.error('[App] Failed to initialize heartbeat service:', error);
          });
        }, 1500);

        console.log('[App] Initialization complete');
      } catch (error) {
        console.error('[App] Initialization error:', error);
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
