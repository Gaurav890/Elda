/**
 * Elder Companion - Color Palette
 * Based on UserDesign.md specifications
 * Optimized for elderly users (high contrast, WCAG AA compliant)
 */

export const Colors = {
  // Primary Colors
  primary: '#3566E5',        // Main brand color (blue)
  primaryLight: '#5B87FF',   // Lighter variant for hover states
  primaryDark: '#2451C7',    // Darker variant for pressed states

  // Accent Colors
  accent: '#F47C63',         // Warm accent (coral/orange)
  accentLight: '#FF9D85',    // Lighter variant
  accentDark: '#D95F43',     // Darker variant

  // Background Colors
  background: '#F9FAFB',     // Main app background (light gray)
  surface: '#FFFFFF',        // Card/container background
  surfaceElevated: '#FFFFFF', // Elevated surface (with shadow)

  // Text Colors
  text: '#1A1A1A',           // Primary text (near black)
  textSecondary: '#6B7280',  // Secondary text (gray)
  textTertiary: '#9CA3AF',   // Tertiary text (lighter gray)
  textInverse: '#FFFFFF',    // Text on dark backgrounds

  // Status Colors
  success: '#4CAF50',        // Success/completed state (green)
  successLight: '#81C784',
  error: '#E53935',          // Error/danger state (red)
  errorLight: '#EF5350',
  warning: '#FFA726',        // Warning state (orange)
  warningLight: '#FFB74D',
  info: '#29B6F6',           // Info state (light blue)
  infoLight: '#4FC3F7',

  // Emergency
  emergency: '#D32F2F',      // Emergency button (dark red)
  emergencyPressed: '#B71C1C', // Emergency button pressed

  // Border Colors
  border: '#E5E7EB',         // Standard border
  borderLight: '#F3F4F6',    // Light border
  borderDark: '#D1D5DB',     // Dark border

  // State Colors
  disabled: '#D1D5DB',       // Disabled elements
  disabledText: '#9CA3AF',   // Disabled text
  placeholder: '#9CA3AF',    // Placeholder text

  // Voice Interaction States
  listening: '#4CAF50',      // Green when listening
  processing: '#FFA726',     // Orange when processing
  speaking: '#3566E5',       // Blue when AI is speaking

  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // Shadows (for styled-components/style objects)
  shadow: {
    color: 'rgba(0, 0, 0, 0.1)',
    elevation1: 'rgba(0, 0, 0, 0.05)',
    elevation2: 'rgba(0, 0, 0, 0.1)',
    elevation3: 'rgba(0, 0, 0, 0.15)',
  },
};

/**
 * Color usage guidelines:
 *
 * PRIMARY: Main actions, navigation, brand elements
 * ACCENT: Secondary actions, highlights, emphasis
 * BACKGROUND: App background, container backgrounds
 * TEXT: All text content (ensure contrast with background)
 * SUCCESS: Completed tasks, positive feedback
 * ERROR: Errors, critical alerts, emergency actions
 * WARNING: Caution, pending states
 * INFO: Informational messages, tips
 */

export default Colors;
