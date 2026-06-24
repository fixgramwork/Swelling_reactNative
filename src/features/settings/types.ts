export type KeyboardCorrectionStrength = 'light' | 'balanced' | 'strict';

export type KeyboardLayout = 'twoSet' | 'tenKey';

export interface KeyboardSettings {
  autoCorrectionEnabled: boolean;
  realtimeCorrectionEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  correctionStrength: KeyboardCorrectionStrength;
  keyboardLayout: KeyboardLayout;
}

export interface KeyboardSettingOption<TValue extends string> {
  value: TValue;
  label: string;
  description: string;
}
