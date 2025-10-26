/**
 * Design System Index
 * Central export point for all design system modules
 */

export { Colors } from './colors';
export { Typography, FontFamily, FontWeight } from './typography';
export { Spacing, BorderRadius, TouchTarget, Elevation, ScreenPadding } from './spacing';

/**
 * Usage:
 *
 * import { Colors, Typography, Spacing } from '../styles';
 *
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: Colors.primary,
 *     padding: Spacing.md,
 *   },
 *   text: {
 *     ...Typography.h1,
 *     color: Colors.text,
 *   },
 * });
 */
