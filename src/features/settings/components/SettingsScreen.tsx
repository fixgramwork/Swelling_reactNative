import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { colors, spacing, typography } from '../../../theme';
import {
  correctionStrengthOptions,
  keyboardLayoutOptions,
} from '../constants';
import type { KeyboardSettingOption, KeyboardSettings } from '../types';

interface SettingsScreenProps {
  accountEmail?: string;
  hasCustomSettings: boolean;
  isAuthenticated?: boolean;
  onLogout: () => void;
  onResetSettings: () => void;
  onUpdateSetting: <TKey extends keyof KeyboardSettings>(
    key: TKey,
    value: KeyboardSettings[TKey],
  ) => void;
  settings: KeyboardSettings;
}

interface SettingSwitchRowProps {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

interface SegmentedSettingProps<TValue extends string> {
  title: string;
  description: string;
  options: readonly KeyboardSettingOption<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
}

function SettingSwitchRow({
  title,
  description,
  value,
  onValueChange,
}: SettingSwitchRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingTextGroup}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={title}
        onValueChange={onValueChange}
        thumbColor={colors.white}
        trackColor={{ false: colors.gray300, true: colors.primaryLight }}
        value={value}
      />
    </View>
  );
}

function SegmentedSetting<TValue extends string>({
  title,
  description,
  options,
  value,
  onChange,
}: SegmentedSettingProps<TValue>) {
  return (
    <View style={styles.segmentedGroup}>
      <View style={styles.segmentedHeader}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>

      <View style={styles.segmentedControl}>
        {options.map((option) => {
          const isActive = option.value === value;

          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.segmentOption,
                isActive && styles.segmentOptionActive,
                pressed && styles.segmentOptionPressed,
              ]}
            >
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={[
                  styles.segmentLabel,
                  isActive && styles.segmentLabelActive,
                ]}
              >
                {option.label}
              </Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={2}
                style={[
                  styles.segmentDescription,
                  isActive && styles.segmentDescriptionActive,
                ]}
              >
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function SettingsScreen({
  accountEmail,
  hasCustomSettings,
  isAuthenticated = false,
  onLogout,
  onResetSettings,
  onUpdateSetting,
  settings,
}: SettingsScreenProps) {
  const { width } = useWindowDimensions();
  const [logoutNotice, setLogoutNotice] = useState<string | null>(null);
  const isWide = width >= 720;
  const accountLabel =
    isAuthenticated && accountEmail ? accountEmail : '로그인 정보 없음';

  const handleLogoutPress = () => {
    onLogout();
    setLogoutNotice(
      isAuthenticated ? '로그아웃되었습니다.' : '로그인된 세션이 없습니다.',
    );
  };

  const updateBooleanSetting =
    (key: keyof Pick<
      KeyboardSettings,
      | 'autoCorrectionEnabled'
      | 'realtimeCorrectionEnabled'
      | 'hapticFeedbackEnabled'
    >) =>
    (value: boolean) => {
      onUpdateSetting(key, value);
    };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, isWide && styles.wideContent]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Swelling Keyboard</Text>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={styles.title}
          >
            설정
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>키보드 설정</Text>
            <Text style={styles.sectionDescription}>
              입력 중 교정 방식과 키보드 동작을 조정합니다.
            </Text>
          </View>

          <SettingSwitchRow
            description="추천 교정문을 바로 입력창에 반영합니다."
            onValueChange={updateBooleanSetting('autoCorrectionEnabled')}
            title="자동 교정"
            value={settings.autoCorrectionEnabled}
          />
          <View style={styles.divider} />
          <SettingSwitchRow
            description="타이핑하는 동안 맞춤법 제안을 실시간으로 갱신합니다."
            onValueChange={updateBooleanSetting('realtimeCorrectionEnabled')}
            title="실시간 검사"
            value={settings.realtimeCorrectionEnabled}
          />
          <View style={styles.divider} />
          <SettingSwitchRow
            description="키 입력과 주요 액션에 짧은 진동 피드백을 사용합니다."
            onValueChange={updateBooleanSetting('hapticFeedbackEnabled')}
            title="키 입력 진동"
            value={settings.hapticFeedbackEnabled}
          />
        </View>

        <View style={styles.section}>
          <SegmentedSetting
            description="제안 빈도와 문장 교정 적극성을 선택합니다."
            onChange={(value) => onUpdateSetting('correctionStrength', value)}
            options={correctionStrengthOptions}
            title="교정 강도"
            value={settings.correctionStrength}
          />
          <View style={styles.divider} />
          <SegmentedSetting
            description="기본 키보드 배열을 선택합니다."
            onChange={(value) => onUpdateSetting('keyboardLayout', value)}
            options={keyboardLayoutOptions}
            title="키보드 배열"
            value={settings.keyboardLayout}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>계정</Text>
            <Text style={styles.sectionDescription}>
              현재 세션을 종료하거나 설정값을 초기화합니다.
            </Text>
          </View>

          <View style={styles.accountBox}>
            <Text style={styles.accountLabel}>로그인 계정</Text>
            <Text selectable style={styles.accountValue}>
              {accountLabel}
            </Text>
          </View>

          {logoutNotice ? (
            <Text selectable style={styles.noticeText}>
              {logoutNotice}
            </Text>
          ) : null}

          <View style={styles.actionRow}>
            <Pressable
              accessibilityRole="button"
              disabled={!hasCustomSettings}
              onPress={onResetSettings}
              style={({ pressed }) => [
                styles.secondaryButton,
                !hasCustomSettings && styles.disabledButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.secondaryButtonText,
                  !hasCustomSettings && styles.disabledButtonText,
                ]}
              >
                설정 초기화
              </Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={handleLogoutPress}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}
            >
              <Text numberOfLines={1} style={styles.logoutButtonText}>
                로그아웃
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.backgroundSecondary,
    flex: 1,
    width: '100%',
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  wideContent: {
    alignSelf: 'center',
    maxWidth: 760,
    width: '100%',
  },
  header: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg,
    boxShadow: '0 10px 28px rgba(25, 31, 40, 0.08)',
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 19,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 39,
  },
  section: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
    boxShadow: '0 8px 22px rgba(25, 31, 40, 0.06)',
  },
  sectionHeader: {
    gap: spacing.xs,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 24,
  },
  sectionDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 20,
  },
  settingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minHeight: 58,
  },
  settingTextGroup: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  settingTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 22,
  },
  settingDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 20,
  },
  divider: {
    backgroundColor: colors.borderLight,
    height: StyleSheet.hairlineWidth,
  },
  segmentedGroup: {
    gap: spacing.md,
  },
  segmentedHeader: {
    gap: 2,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  segmentOption: {
    backgroundColor: colors.gray50,
    borderColor: colors.border,
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minHeight: 86,
    minWidth: 0,
    padding: spacing.sm,
  },
  segmentOptionActive: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  segmentOptionPressed: {
    opacity: 0.82,
  },
  segmentLabel: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 19,
    textAlign: 'center',
  },
  segmentLabelActive: {
    color: colors.primaryDark,
  },
  segmentDescription: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 17,
    textAlign: 'center',
  },
  segmentDescriptionActive: {
    color: colors.primary,
  },
  accountBox: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderLight,
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  accountLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 19,
  },
  accountValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 22,
  },
  noticeText: {
    color: colors.primaryDark,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderCurve: 'continuous',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    color: colors.primaryDark,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 19,
  },
  disabledButton: {
    opacity: 0.52,
  },
  disabledButtonText: {
    color: colors.textTertiary,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: colors.errorTint,
    borderCurve: 'continuous',
    borderRadius: 14,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 0,
    paddingHorizontal: spacing.md,
  },
  logoutButtonPressed: {
    opacity: 0.82,
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 19,
  },
  buttonPressed: {
    opacity: 0.78,
  },
});
