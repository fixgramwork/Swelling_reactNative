import { DEFAULT_KEYBOARD_SETTINGS } from './constants';
import type { KeyboardSettings } from './types';

export function isDefaultKeyboardSettings(settings: KeyboardSettings) {
  return (
    settings.autoCorrectionEnabled === DEFAULT_KEYBOARD_SETTINGS.autoCorrectionEnabled &&
    settings.realtimeCorrectionEnabled ===
      DEFAULT_KEYBOARD_SETTINGS.realtimeCorrectionEnabled &&
    settings.hapticFeedbackEnabled === DEFAULT_KEYBOARD_SETTINGS.hapticFeedbackEnabled &&
    settings.correctionStrength === DEFAULT_KEYBOARD_SETTINGS.correctionStrength &&
    settings.keyboardLayout === DEFAULT_KEYBOARD_SETTINGS.keyboardLayout
  );
}
