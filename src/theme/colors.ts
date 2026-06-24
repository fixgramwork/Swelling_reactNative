export const colors = {
  // Primary colors
  primary: '#0064FF',
  primaryDark: '#0050D8',
  primaryLight: '#5B9DFF',
  primaryTint: '#E8F2FF',

  // Secondary colors
  secondary: '#20C997',
  secondaryDark: '#12A77E',
  secondaryLight: '#DDFBF2',

  // Neutral colors
  black: '#000000',
  white: '#FFFFFF',
  gray50: '#FAFBFC',
  gray100: '#F2F4F6',
  gray200: '#E5E8EB',
  gray300: '#D1D6DB',
  gray400: '#B0B8C1',
  gray500: '#8B95A1',
  gray600: '#6B7684',
  gray700: '#4E5968',
  gray800: '#333D4B',
  gray900: '#202632',

  // Semantic colors
  success: '#20C997',
  warning: '#F59F00',
  error: '#F04452',
  info: '#4DABF7',
  successTint: '#E6FCF5',
  warningTint: '#FFF4D6',
  errorTint: '#FFECEE',
  infoTint: '#E7F5FF',

  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#F2F4F6',
  surface: '#FFFFFF',
  surfaceMuted: '#F9FAFB',
  elevated: '#FFFFFF',

  // Text
  textPrimary: '#202632',
  textSecondary: '#4E5968',
  textTertiary: '#8B95A1',

  // Border
  border: '#E5E8EB',
  borderLight: '#EDF0F3',
} as const;

export type ColorName = keyof typeof colors;
