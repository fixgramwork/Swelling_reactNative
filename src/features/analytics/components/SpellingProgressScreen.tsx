import { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { colors, spacing, typography } from '@/theme';
import { dailySpellingMetrics } from '@/features/analytics/constants';
import {
  formatSignedPercentPoint,
  getDailySpellingProgress,
  getSpellingProgressSummary,
} from '@/features/analytics/utils';
import { DailyErrorRateChart } from './DailyErrorRateChart';
import { MetricCard } from './MetricCard';

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatNumber(value: number) {
  return value.toLocaleString('ko-KR');
}

export function SpellingProgressScreen() {
  const { width } = useWindowDimensions();
  const progressData = useMemo(
    () => getDailySpellingProgress(dailySpellingMetrics),
    [],
  );
  const summary = useMemo(
    () => getSpellingProgressSummary(dailySpellingMetrics),
    [],
  );
  const isWide = width >= 720;

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isWide && styles.wideContent,
        ]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroTitleGroup}>
              <Text style={styles.eyebrow}>이번 주 학습</Text>
              <Text
                adjustsFontSizeToFit
                numberOfLines={1}
                style={styles.title}
              >
                맞춤법 성장 분석
              </Text>
            </View>
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeLabel}>오늘</Text>
              <Text selectable style={styles.currentBadgeValue}>
                {formatPercent(summary.currentErrorRatePercent)}
              </Text>
            </View>
          </View>

          <View style={styles.heroMetricRow}>
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricLabel}>시작 오답률</Text>
              <Text selectable style={styles.heroMetricValue}>
                {formatPercent(summary.startErrorRatePercent)}
              </Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricLabel}>현재 오답률</Text>
              <Text selectable style={styles.heroMetricValue}>
                {formatPercent(summary.currentErrorRatePercent)}
              </Text>
            </View>
            <View style={styles.heroDivider} />
            <View style={styles.heroMetric}>
              <Text style={styles.heroMetricLabel}>변화폭</Text>
              <Text selectable style={[styles.heroMetricValue, styles.improvedValue]}>
                {formatSignedPercentPoint(summary.improvementPercentPoint)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricRow}>
            <MetricCard
              detail={`${formatPercent(
                summary.improvementRatioPercent,
              )}만큼 오답률 감소`}
              label="개선률"
              tone="green"
              value={formatPercent(summary.improvementRatioPercent)}
            />
            <MetricCard
              detail={`${summary.improvementStreakDays}일 연속 오답률 하락`}
              label="연속 개선"
              tone="blue"
              value={`${summary.improvementStreakDays}일`}
            />
          </View>
          <View style={styles.metricRow}>
            <MetricCard
              detail={`이번 주 평균 기준`}
              label="평균 정확도"
              tone="orange"
              value={formatPercent(summary.averageAccuracyPercent)}
            />
            <MetricCard
              detail={`${formatNumber(summary.totalCorrectedSentences)}문장 교정`}
              label="분석 단어"
              tone="gray"
              value={formatNumber(summary.totalCheckedWords)}
            />
          </View>
        </View>

        <DailyErrorRateChart data={progressData} />

        <View style={styles.summaryPanel}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>누적 오답</Text>
            <Text selectable style={styles.summaryValue}>
              {formatNumber(summary.totalIncorrectWords)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>교정 완료</Text>
            <Text selectable style={styles.summaryValue}>
              {formatNumber(summary.totalCorrectedSentences)}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>오답률 감소</Text>
            <Text selectable style={[styles.summaryValue, styles.improvedValue]}>
              {formatSignedPercentPoint(summary.improvementPercentPoint)}
            </Text>
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
  hero: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderCurve: 'continuous',
    borderRadius: 18,
    borderWidth: 1,
    gap: spacing.xl,
    overflow: 'hidden',
    padding: spacing.lg,
    boxShadow: '0 10px 28px rgba(25, 31, 40, 0.08)',
  },
  heroTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  heroTitleGroup: {
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
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
  currentBadge: {
    alignItems: 'flex-end',
    backgroundColor: colors.primaryTint,
    borderColor: 'rgba(0, 100, 255, 0.14)',
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 88,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  currentBadgeLabel: {
    color: colors.primary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 16,
  },
  currentBadgeValue: {
    color: colors.primaryDark,
    fontSize: typography.fontSize.xl,
    fontVariant: ['tabular-nums'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: 27,
  },
  heroMetricRow: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderLight,
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 78,
    overflow: 'hidden',
  },
  heroMetric: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  heroMetricLabel: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 16,
    textAlign: 'center',
  },
  heroMetricValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.xl,
    fontVariant: ['tabular-nums'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: 27,
    textAlign: 'center',
  },
  improvedValue: {
    color: colors.success,
  },
  heroDivider: {
    backgroundColor: colors.borderLight,
    width: StyleSheet.hairlineWidth,
  },
  metricGrid: {
    gap: spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryPanel: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderCurve: 'continuous',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 86,
    overflow: 'hidden',
    boxShadow: '0 8px 22px rgba(25, 31, 40, 0.06)',
  },
  summaryRow: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 16,
    textAlign: 'center',
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontVariant: ['tabular-nums'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: 24,
    textAlign: 'center',
  },
  summaryDivider: {
    backgroundColor: colors.borderLight,
    width: StyleSheet.hairlineWidth,
  },
});
