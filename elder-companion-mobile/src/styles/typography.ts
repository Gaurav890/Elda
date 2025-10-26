/**
 * Elder Companion - Typography System
 * Based on UserDesign.md specifications
 * Optimized for elderly users (larger sizes, clear hierarchy)
 */

import { Platform } from 'react-native';

/**
 * Font Families
 * Note: Custom fonts (Playfair Display, Nunito Sans) need to be installed
 * via react-native-asset or manually linked
 */
export const FontFamily = {
  // Headings (elegant serif)
  heading: Platform.select({
    ios: 'Playfair Display',
    android: 'PlayfairDisplay-Bold',
    default: 'serif',
  }),

  // Body text (clean sans-serif)
  body: Platform.select({
    ios: 'Nunito Sans',
    android: 'NunitoSans-Regular',
    default: 'sans-serif',
  }),

  // Fallback system fonts
  system: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
};

/**
 * Font Weights
 */
export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

/**
 * Typography Scale
 * Larger than standard mobile apps for elderly users
 */
export const Typography = {
  // Display (very large, rare use)
  display: {
    fontFamily: FontFamily.heading,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },

  // Heading 1 (page titles)
  h1: {
    fontFamily: FontFamily.heading,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
  },

  // Heading 2 (section titles)
  h2: {
    fontFamily: FontFamily.heading,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: FontWeight.bold,
    letterSpacing: 0,
  },

  // Heading 3 (subsection titles)
  h3: {
    fontFamily: FontFamily.body,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0,
  },

  // Heading 4 (card titles)
  h4: {
    fontFamily: FontFamily.body,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0,
  },

  // Body Large (default body text - larger for elderly)
  bodyLarge: {
    fontFamily: FontFamily.body,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  },

  // Body (standard body text)
  body: {
    fontFamily: FontFamily.body,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  },

  // Body Small (captions, secondary text)
  bodySmall: {
    fontFamily: FontFamily.body,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeight.regular,
    letterSpacing: 0,
  },

  // Button Large (main action buttons)
  buttonLarge: {
    fontFamily: FontFamily.body,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  },

  // Button (standard buttons)
  button: {
    fontFamily: FontFamily.body,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.5,
  },

  // Button Small (secondary buttons)
  buttonSmall: {
    fontFamily: FontFamily.body,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.3,
  },

  // Caption (small labels, hints)
  caption: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FontWeight.regular,
    letterSpacing: 0.2,
  },

  // Overline (uppercase labels)
  overline: {
    fontFamily: FontFamily.body,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
};

/**
 * Typography usage guidelines:
 *
 * DISPLAY: Hero text, splash screens
 * H1: Main page title (e.g., "Welcome, Maggie")
 * H2: Section headers (e.g., "Today's Reminders")
 * H3: Card titles (e.g., "Medication Time")
 * BODY_LARGE: Important information that needs emphasis
 * BODY: Standard content, conversation text
 * BODY_SMALL: Secondary information, timestamps
 * BUTTON_LARGE: Primary actions (e.g., "TALK TO ME")
 * BUTTON: Standard buttons (e.g., "Mark Done")
 * CAPTION: Helper text, field labels
 * OVERLINE: Category labels, status badges
 */

export default Typography;
