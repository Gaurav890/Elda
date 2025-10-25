// Token Storage Utilities

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'caregiver';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Store access token in localStorage
 */
export function setAccessToken(token: string): void {
  if (isBrowser) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (isBrowser) {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Remove access token from localStorage
 */
export function removeAccessToken(): void {
  if (isBrowser) {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Store refresh token in localStorage
 */
export function setRefreshToken(token: string): void {
  if (isBrowser) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (isBrowser) {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
}

/**
 * Remove refresh token from localStorage
 */
export function removeRefreshToken(): void {
  if (isBrowser) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

/**
 * Store user data in localStorage
 */
export function setUser(user: any): void {
  if (isBrowser && user) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }
}

/**
 * Get user data from localStorage
 */
export function getUser(): any | null {
  if (isBrowser) {
    try {
      const user = localStorage.getItem(USER_KEY);
      // Handle edge cases: null, "undefined", "null", empty string
      if (!user || user === 'undefined' || user === 'null' || user === '') {
        return null;
      }
      return JSON.parse(user);
    } catch (error) {
      console.error('Failed to parse user data:', error);
      // Clear invalid data
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
  return null;
}

/**
 * Remove user data from localStorage
 */
export function removeUser(): void {
  if (isBrowser) {
    localStorage.removeItem(USER_KEY);
  }
}

/**
 * Clear all auth data from localStorage
 */
export function clearAuthData(): void {
  removeAccessToken();
  removeRefreshToken();
  removeUser();
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
