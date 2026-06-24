import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from './src/features/auth/hooks/useAuth';
import { SpellingProgressScreen } from './src/features/analytics';
import { CorrectionKeyboard } from './src/features/keyboard/components/CorrectionKeyboard';
import { SettingsScreen, useKeyboardSettings } from './src/features/settings';
import { colors, spacing, typography } from './src/theme';

type AppTab = 'keyboard' | 'analytics' | 'settings';

interface AppTabItem {
  id: AppTab;
  label: string;
  description: string;
}

const appTabs: readonly AppTabItem[] = [
  { id: 'keyboard', label: '키보드', description: '실시간 교정' },
  { id: 'analytics', label: '분석', description: '성장 기록' },
  { id: 'settings', label: '설정', description: '입력 환경' },
];

const transitionDuration = {
  out: 110,
  in: 210,
} as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('keyboard');
  const [renderedTab, setRenderedTab] = useState<AppTab>('keyboard');
  const [tabBarWidth, setTabBarWidth] = useState(0);
  const { isAuthenticated, logout, user } = useAuth();
  const { settings, hasCustomSettings, updateSetting, resetSettings } =
    useKeyboardSettings();
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const screenTranslateX = useRef(new Animated.Value(0)).current;
  const tabIndicatorIndex = useRef(new Animated.Value(0)).current;
  const screenAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const tabSlotWidth = tabBarWidth > 0 ? (tabBarWidth - spacing.sm) / appTabs.length : 0;
  const tabIndicatorTranslateX = Animated.multiply(tabIndicatorIndex, tabSlotWidth);

  useEffect(() => {
    const activeIndex = appTabs.findIndex((tab) => tab.id === activeTab);

    Animated.spring(tabIndicatorIndex, {
      damping: 24,
      mass: 0.8,
      stiffness: 240,
      toValue: Math.max(activeIndex, 0),
      useNativeDriver: true,
    }).start();
  }, [activeTab, tabIndicatorIndex]);

  const handleTabPress = (nextTab: AppTab) => {
    if (nextTab === activeTab) {
      return;
    }

    const currentIndex = appTabs.findIndex((tab) => tab.id === renderedTab);
    const nextIndex = appTabs.findIndex((tab) => tab.id === nextTab);
    const direction = nextIndex > currentIndex ? 1 : -1;

    setActiveTab(nextTab);
    screenAnimationRef.current?.stop();

    screenAnimationRef.current = Animated.parallel([
      Animated.timing(screenOpacity, {
        duration: transitionDuration.out,
        easing: Easing.out(Easing.quad),
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(screenTranslateX, {
        duration: transitionDuration.out,
        easing: Easing.out(Easing.quad),
        toValue: -14 * direction,
        useNativeDriver: true,
      }),
    ]);

    screenAnimationRef.current.start(({ finished }) => {
      if (!finished) {
        return;
      }

      setRenderedTab(nextTab);
      screenTranslateX.setValue(14 * direction);

      screenAnimationRef.current = Animated.parallel([
        Animated.timing(screenOpacity, {
          duration: transitionDuration.in,
          easing: Easing.out(Easing.cubic),
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(screenTranslateX, {
          duration: transitionDuration.in,
          easing: Easing.out(Easing.cubic),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]);

      screenAnimationRef.current.start();
    });
  };

  return (
    <View style={styles.app}>
      <Animated.View
        style={[
          styles.screen,
          {
            opacity: screenOpacity,
            transform: [{ translateX: screenTranslateX }],
          },
        ]}
      >
        {renderedTab === 'settings' ? (
          <SettingsScreen
            accountEmail={user?.email}
            hasCustomSettings={hasCustomSettings}
            isAuthenticated={isAuthenticated}
            onLogout={logout}
            onResetSettings={resetSettings}
            onUpdateSetting={updateSetting}
            settings={settings}
          />
        ) : renderedTab === 'analytics' ? (
          <SpellingProgressScreen />
        ) : (
          <CorrectionKeyboard />
        )}
      </Animated.View>

      <View style={styles.tabBarWrap}>
        <View
          onLayout={(event) => setTabBarWidth(event.nativeEvent.layout.width)}
          style={styles.tabBar}
        >
          {tabSlotWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.tabIndicator,
                {
                  transform: [{ translateX: tabIndicatorTranslateX }],
                  width: tabSlotWidth,
                },
              ]}
            />
          ) : null}

          {appTabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                key={tab.id}
                onPress={() => handleTabPress(tab.id)}
                style={({ pressed }) => [
                  styles.tabButton,
                  pressed && styles.tabButtonPressed,
                ]}
              >
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  style={[
                    styles.tabDescription,
                    isActive && styles.tabDescriptionActive,
                  ]}
                >
                  {tab.description}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    backgroundColor: colors.backgroundSecondary,
    flex: 1,
  },
  screen: {
    flex: 1,
    minHeight: 0,
  },
  tabBarWrap: {
    backgroundColor: colors.backgroundSecondary,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderColor: 'rgba(209, 214, 219, 0.72)',
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 68,
    overflow: 'hidden',
    padding: 4,
    position: 'relative',
    boxShadow: '0 8px 24px rgba(25, 31, 40, 0.10)',
  },
  tabIndicator: {
    backgroundColor: colors.primaryTint,
    borderColor: 'rgba(0, 100, 255, 0.14)',
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    bottom: 4,
    left: 4,
    position: 'absolute',
    top: 4,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    minHeight: 60,
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    zIndex: 1,
  },
  tabButtonPressed: {
    opacity: 0.82,
  },
  tabLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 21,
  },
  tabLabelActive: {
    color: colors.primaryDark,
  },
  tabDescription: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 16,
  },
  tabDescriptionActive: {
    color: colors.primary,
  },
});
