/**
 * Elder Companion Mobile App
 * Entry Point
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Register background handler for Firebase notifications
// Note: This must be outside of any component
try {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('[Background] Message received:', remoteMessage);
    // Background handler logic is in notification.service.ts
    return Promise.resolve();
  });
} catch (error) {
  console.log('[Background] Firebase messaging not available yet:', error.message);
}

AppRegistry.registerComponent(appName, () => App);
