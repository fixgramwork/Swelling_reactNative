export const APP_NAME = 'Swelling';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@swelling:auth_token',
  USER: '@swelling:user',
  SETTINGS: '@swelling:settings',
} as const;

export const ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  LOGIN: '/login',
  SETTINGS: '/settings',
} as const;

export const KEYBOARD_SETTINGS = {
  DEFAULT_CORRECTION_STRENGTH: 'medium',
  AUTO_CORRECTION_ENABLED: true,
} as const;
