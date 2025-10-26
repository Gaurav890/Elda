/**
 * Elder Companion - Spacing System
 * Based on 8dp grid system from UserDesign.md
 * All values are multiples of 8 for consistent spacing
 */

/**
 * Base spacing unit (8dp)
 */
const BASE_UNIT = 8;

/**
 * Spacing scale
 * Use these values for margins, padding, gaps, etc.
 */
export const Spacing = {
  // Extra small (4dp) - tight spacing
  xs: BASE_UNIT * 0.5,   // 4

  // Small (8dp) - minimal spacing
  sm: BASE_UNIT,          // 8

  // Medium (16dp) - default spacing
  md: BASE_UNIT * 2,      // 16

  // Large (24dp) - section spacing
  lg: BASE_UNIT * 3,      // 24

  // Extra large (32dp) - major section spacing
  xl: BASE_UNIT * 4,      // 32

  // 2XL (40dp) - screen padding
  xxl: BASE_UNIT * 5,     // 40

  // 3XL (48dp) - large gaps
  xxxl: BASE_UNIT * 6,    // 48

  // 4XL (64dp) - very large gaps
  xxxxl: BASE_UNIT * 8,   // 64
};

/**
 * Border Radius
 * Consistent rounding for UI elements
 */
export const BorderRadius = {
  // No radius
  none: 0,

  // Small (4dp) - subtle rounding
  sm: 4,

  // Medium (8dp) - standard cards
  md: 8,

  // Large (16dp) - buttons, important cards
  lg: 16,

  // Extra large (24dp) - special elements
  xl: 24,

  // Circular (9999) - fully rounded
  full: 9999,
};

/**
 * Touch Target Sizes
 * Minimum sizes for tap targets (important for elderly users)
 */
export const TouchTarget = {
  // Minimum touch target (per WCAG guidelines)
  minimum: 44,

  // Comfortable touch target
  comfortable: 52,

  // Large touch target (for main actions)
  large: 64,

  // Extra large touch target (for primary action button)
  xlarge: 80,
};

/**
 * Elevation (Shadow)
 * Consistent shadow depths for layering
 */
export const Elevation = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  xlarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
};

/**
 * Screen Padding
 * Consistent padding for different screen types
 */
export const ScreenPadding = {
  // Horizontal screen padding
  horizontal: Spacing.md,  // 16dp

  // Vertical screen padding
  vertical: Spacing.lg,    // 24dp

  // Safe area insets (additional)
  safeArea: {
    top: 20,
    bottom: 20,
  },
};

/**
 * Spacing usage guidelines:
 *
 * XS (4dp): Between related items in a group
 * SM (8dp): Within components, minimal gaps
 * MD (16dp): Default spacing, screen horizontal padding
 * LG (24dp): Between sections, screen vertical padding
 * XL (32dp): Major section breaks
 * XXL (40dp): Large separation
 *
 * Touch Targets:
 * - Use MINIMUM (44dp) for secondary actions
 * - Use COMFORTABLE (52dp) for standard buttons
 * - Use LARGE (64dp) for important actions
 * - Use XLARGE (80dp) for main action button (e.g., mic)
 */

export default Spacing;
