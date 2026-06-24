import type {
  KeyboardCorrectionStrength,
  KeyboardLayout,
  KeyboardSettingOption,
  KeyboardSettings,
} from './types';

export const DEFAULT_KEYBOARD_SETTINGS: KeyboardSettings = {
  autoCorrectionEnabled: true,
  realtimeCorrectionEnabled: true,
  hapticFeedbackEnabled: false,
  correctionStrength: 'balanced',
  keyboardLayout: 'twoSet',
};

export const correctionStrengthOptions = [
  {
    value: 'light',
    label: '약하게',
    description: '명백한 오타만 제안',
  },
  {
    value: 'balanced',
    label: '기본',
    description: '맞춤법과 띄어쓰기 균형 교정',
  },
  {
    value: 'strict',
    label: '꼼꼼하게',
    description: '문장 흐름까지 적극 제안',
  },
] satisfies readonly KeyboardSettingOption<KeyboardCorrectionStrength>[];

export const keyboardLayoutOptions = [
  {
    value: 'twoSet',
    label: '두벌식',
    description: '표준 한글 입력 배열',
  },
  {
    value: 'tenKey',
    label: '천지인',
    description: '한 손 입력에 적합한 배열',
  },
] satisfies readonly KeyboardSettingOption<KeyboardLayout>[];
