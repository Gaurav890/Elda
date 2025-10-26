/**
 * Elder Companion Mobile App
 * Entry Point
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Register background handler - MUST be outside of App component
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('[Background] Message received:', remoteMessage);
  // Background handler logic is in notification.service.ts
  // This registration is required for FCM to work
});

AppRegistry.registerComponent(appName, () => App);
