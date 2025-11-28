/**
 * Theme System with Multi-Tenant Branding Support
 */

import { Platform } from 'react-native';

// ============================================================================
// Color Palette
// ============================================================================

export const colors = {
  // Primary colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Secondary colors (nature theme from original app)
  secondary: {
    50: '#f7f8f4',
    100: '#eef2e6',
    200: '#dde5cd',
    300: '#c4d4a8',
    400: '#a8bf7e',
    500: '#8ba85c',
    600: '#6b7c4a',
    700: '#556340',
    800: '#465137',
    900: '#3c4530',
  },

  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },

  // Semantic colors
  success: {
    light: '#86efac',
    main: '#22c55e',
    dark: '#15803d',
  },
  warning: {
    light: '#fde047',
    main: '#eab308',
    dark: '#a16207',
  },
  error: {
    light: '#fca5a5',
    main: '#ef4444',
    dark: '#b91c1c',
  },
  info: {
    light: '#93c5fd',
    main: '#3b82f6',
    dark: '#1d4ed8',
  },

  // Common colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Background colors
  background: {
    default: '#ffffff',
    paper: '#f9fafb',
    elevated: '#ffffff',
    dark: '#111827',
  },

  // Text colors
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    disabled: '#9ca3af',
    inverse: '#ffffff',
  },

  // Border colors
  border: {
    light: '#e5e7eb',
    default: '#d1d5db',
    dark: '#9ca3af',
  },
};

// ============================================================================
// Typography
// ============================================================================

export const typography = {
  // Font families
  fontFamily: {
    sans: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    serif: Platform.select({
      ios: 'Georgia',
      android: 'serif',
      default: 'Georgia',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.4,
    wider: 0.8,
  },
};

// ============================================================================
// Spacing
// ============================================================================

export const spacing = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
};

// ============================================================================
// Border Radius
// ============================================================================

export const borderRadius = {
  none: 0,
  sm: 4,
  default: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
};

// ============================================================================
// Shadows
// ============================================================================

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// ============================================================================
// Z-Index
// ============================================================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
};

// ============================================================================
// Breakpoints (for responsive design)
// ============================================================================

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// ============================================================================
// Animation Durations
// ============================================================================

export const durations = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 700,
};

// ============================================================================
// Default Theme
// ============================================================================

export interface Theme {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
  // Studio branding
  branding: {
    logo?: string | null;
    studioName?: string;
    customPrimary?: string;
    customSecondary?: string;
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: colors.primary[600],
    primaryLight: colors.primary[400],
    primaryDark: colors.primary[800],
    secondary: colors.secondary[600],
    secondaryLight: colors.secondary[400],
    secondaryDark: colors.secondary[800],
    background: colors.background.default,
    surface: colors.background.paper,
    text: colors.text.primary,
    textSecondary: colors.text.secondary,
    border: colors.border.default,
    error: colors.error.main,
    success: colors.success.main,
    warning: colors.warning.main,
    info: colors.info.main,
  },
  spacing,
  typography,
  borderRadius,
  shadows,
  branding: {},
};

export const darkTheme: Theme = {
  colors: {
    primary: colors.primary[400],
    primaryLight: colors.primary[300],
    primaryDark: colors.primary[600],
    secondary: colors.secondary[400],
    secondaryLight: colors.secondary[300],
    secondaryDark: colors.secondary[600],
    background: colors.neutral[900],
    surface: colors.neutral[800],
    text: colors.text.inverse,
    textSecondary: colors.neutral[400],
    border: colors.neutral[700],
    error: colors.error.light,
    success: colors.success.light,
    warning: colors.warning.light,
    info: colors.info.light,
  },
  spacing,
  typography,
  borderRadius,
  shadows,
  branding: {},
};

// ============================================================================
// Theme Utilities
// ============================================================================

export const createStudioTheme = (
  baseTheme: Theme,
  branding: Theme['branding']
): Theme => {
  const customColors = { ...baseTheme.colors };

  if (branding.customPrimary) {
    customColors.primary = branding.customPrimary;
  }
  if (branding.customSecondary) {
    customColors.secondary = branding.customSecondary;
  }

  return {
    ...baseTheme,
    colors: customColors,
    branding,
  };
};

// Helper function to get spacing value
export const getSpacing = (value: keyof typeof spacing): number => spacing[value];

// Helper function to create consistent shadows
export const getShadow = (level: keyof typeof shadows) => shadows[level];
