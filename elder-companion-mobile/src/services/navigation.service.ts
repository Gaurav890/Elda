/**
 * Navigation Service
 * Provides global navigation reference for navigating from outside React components
 * Used by notification handlers to navigate when notifications are received
 */

import { createNavigationContainerRef, NavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from '../types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navigate to a screen from anywhere in the app
 */
export function navigate(name: keyof RootStackParamList, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params);
  } else {
    console.warn('[NavigationService] Navigation not ready');
  }
}

/**
 * Go back to previous screen
 */
export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}

/**
 * Reset navigation to a specific screen
 */
export function reset(name: keyof RootStackParamList) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: name as any }],
    });
  }
}

/**
 * Get current route name
 */
export function getCurrentRoute(): string | undefined {
  if (navigationRef.isReady()) {
    return navigationRef.getCurrentRoute()?.name;
  }
  return undefined;
}
