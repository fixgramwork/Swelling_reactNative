import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../../theme';
import type { DailySpellingProgressPoint } from '../types';

interface DailyErrorRateChartProps {
  data: DailySpellingProgressPoint[];
}

function getRateColor(errorRatePercent: number) {
  if (errorRatePercent <= 15) {
    return colors.success;
  }

  if (errorRatePercent >= 25) {
    return colors.warning;
  }

  return colors.primary;
}

function getDeltaLabel(value: number) {
  if (value > 0) {
    return `↓ ${value.toFixed(1)}%p`;
  }

  if (value < 0) {
    return `↑ ${Math.abs(value).toFixed(1)}%p`;
  }

  return '0.0%p';
}

export function DailyErrorRateChart({ data }: DailyErrorRateChartProps) {
  const maxErrorRate = Math.max(
    10,
    ...data.map((point) => point.errorRatePercent),
  );
  const chartMax = Math.min(100, Math.ceil(maxErrorRate / 10) * 10);
  const deltaPoints = data.filter(
    (point) => point.improvementFromPreviousPercentPoint !== null,
  );
  const maxDelta = Math.max(
    1,
    ...deltaPoints.map((point) =>
      Math.abs(point.improvementFromPreviousPercentPoint ?? 0),
    ),
  );
  const firstLabel = data[0]?.label ?? '';
  const latestLabel = data[data.length - 1]?.label ?? '';

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleGroup}>
          <Text style={styles.sectionTitle}>일별 오답률</Text>
          <Text selectable style={styles.sectionSubtitle}>
            {firstLabel} - {latestLabel}
          </Text>
        </View>
        <View style={styles.legendGroup}>
          <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
          <Text style={styles.legendText}>낮음</Text>
          <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
          <Text style={styles.legendText}>높음</Text>
        </View>
      </View>

      <View style={styles.chartRow}>
        <View style={styles.yAxis}>
          <Text style={styles.axisLabel}>{chartMax}%</Text>
          <Text style={styles.axisLabel}>{Math.round(chartMax / 2)}%</Text>
          <Text style={styles.axisLabel}>0%</Text>
        </View>

        <View style={styles.plotArea}>
          <View style={[styles.gridLine, styles.gridLineTop]} />
          <View style={[styles.gridLine, styles.gridLineMiddle]} />
          <View style={[styles.gridLine, styles.gridLineBottom]} />

          <View style={styles.barRow}>
            {data.map((point, index) => {
              const isLatest = index === data.length - 1;
              const barHeight = Math.max(
                6,
                (point.errorRatePercent / chartMax) * 100,
              );
              const barColor = isLatest
                ? colors.primary
                : getRateColor(point.errorRatePercent);

              return (
                <View
                  accessibilityLabel={`${point.label} 오답률 ${point.errorRatePercent.toFixed(
                    1,
                  )}퍼센트`}
                  key={point.date}
                  style={styles.barColumn}
                >
                  <View style={styles.barSlot}>
                    <Text
                      adjustsFontSizeToFit
                      numberOfLines={1}
                      selectable
                      style={styles.barValue}
                    >
                      {point.errorRatePercent.toFixed(1)}
                    </Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: barColor,
                          height: `${barHeight}%`,
                        },
                        isLatest && styles.latestBar,
                      ]}
                    />
                  </View>
                  <Text numberOfLines={1} style={styles.xAxisLabel}>
                    {isLatest ? '오늘' : point.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.deltaSection}>
        <Text style={styles.deltaTitle}>전일 대비 변화</Text>
        <View style={styles.deltaList}>
          {deltaPoints.map((point) => {
            const delta = point.improvementFromPreviousPercentPoint ?? 0;
            const isImproved = delta >= 0;
            const fillWidth = Math.max(12, (Math.abs(delta) / maxDelta) * 100);

            return (
              <View key={`${point.date}-delta`} style={styles.deltaRow}>
                <Text style={styles.deltaDate}>{point.label}</Text>
                <View style={styles.deltaTrack}>
                  <View
                    style={[
                      styles.deltaFill,
                      {
                        backgroundColor: isImproved
                          ? colors.success
                          : colors.warning,
                        width: `${fillWidth}%`,
                      },
                    ]}
                  />
                </View>
                <Text
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  selectable
                  style={[
                    styles.deltaValue,
                    { color: isImproved ? colors.success : colors.warning },
                  ]}
                >
                  {getDeltaLabel(delta)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderCurve: 'continuous',
    borderRadius: 8,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.md,
  },
  sectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  sectionTitleGroup: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 24,
  },
  sectionSubtitle: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.sm,
    fontVariant: ['tabular-nums'],
    fontWeight: typography.fontWeight.medium,
    lineHeight: 19,
  },
  legendGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    justifyContent: 'flex-end',
    maxWidth: 112,
  },
  legendDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 16,
  },
  chartRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 210,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingBottom: 26,
    paddingTop: 20,
    width: 34,
  },
  axisLabel: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.xs,
    fontVariant: ['tabular-nums'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 16,
    textAlign: 'right',
  },
  plotArea: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  gridLine: {
    backgroundColor: colors.borderLight,
    height: StyleSheet.hairlineWidth,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  gridLineTop: {
    top: 22,
  },
  gridLineMiddle: {
    top: 102,
  },
  gridLineBottom: {
    bottom: 27,
  },
  barRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    height: 210,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    minWidth: 0,
  },
  barSlot: {
    alignItems: 'center',
    height: 176,
    justifyContent: 'flex-end',
    minWidth: 0,
    width: '100%',
  },
  barValue: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontVariant: ['tabular-nums'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: 16,
    marginBottom: spacing.xs,
    textAlign: 'center',
    width: '100%',
  },
  bar: {
    borderCurve: 'continuous',
    borderRadius: 8,
    minHeight: 8,
    width: '100%',
  },
  latestBar: {
    boxShadow: '0 6px 14px rgba(0, 122, 255, 0.22)',
  },
  xAxisLabel: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 16,
    textAlign: 'center',
    width: '100%',
  },
  deltaSection: {
    borderTopColor: colors.borderLight,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  deltaTitle: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    lineHeight: 19,
  },
  deltaList: {
    gap: spacing.sm,
  },
  deltaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 24,
    minWidth: 0,
  },
  deltaDate: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    fontVariant: ['tabular-nums'],
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 16,
    width: 34,
  },
  deltaTrack: {
    backgroundColor: colors.gray100,
    borderCurve: 'continuous',
    borderRadius: 999,
    flex: 1,
    height: 8,
    overflow: 'hidden',
  },
  deltaFill: {
    borderCurve: 'continuous',
    borderRadius: 999,
    height: 8,
  },
  deltaValue: {
    fontSize: typography.fontSize.xs,
    fontVariant: ['tabular-nums'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: 16,
    textAlign: 'right',
    width: 64,
  },
});
