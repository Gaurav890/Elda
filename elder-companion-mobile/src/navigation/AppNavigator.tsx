/**
 * App Navigator
 * Main navigation configuration for the app
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { usePatientStore } from '../stores/patient.store';

// Screens
import SetupScreen from '../screens/SetupScreen';
import HomeScreen from '../screens/HomeScreen';
import VoiceChatScreen from '../screens/VoiceChatScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { isSetupComplete, loadPatientData } = usePatientStore();

  // Load patient data on app start
  useEffect(() => {
    loadPatientData();
  }, [loadPatientData]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isSetupComplete ? 'Home' : 'Setup'}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#ffffff' },
        }}>
        {!isSetupComplete ? (
          <Stack.Screen name="Setup" component={SetupScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="VoiceChat" component={VoiceChatScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
