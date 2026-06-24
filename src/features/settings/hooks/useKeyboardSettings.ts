import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_KEYBOARD_SETTINGS } from '../constants';
import type { KeyboardSettings } from '../types';
import { isDefaultKeyboardSettings } from '../utils';

export function useKeyboardSettings(
  initialSettings: KeyboardSettings = DEFAULT_KEYBOARD_SETTINGS,
) {
  const [settings, setSettings] = useState<KeyboardSettings>(initialSettings);

  const updateSetting = useCallback(
    <TKey extends keyof KeyboardSettings>(
      key: TKey,
      value: KeyboardSettings[TKey],
    ) => {
      setSettings((currentSettings) => ({
        ...currentSettings,
        [key]: value,
      }));
    },
    [],
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_KEYBOARD_SETTINGS);
  }, []);

  const hasCustomSettings = useMemo(
    () => !isDefaultKeyboardSettings(settings),
    [settings],
  );

  return {
    settings,
    hasCustomSettings,
    updateSetting,
    resetSettings,
  };
}
