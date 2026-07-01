import { Text, View } from 'react-native';
import { colors } from '@/theme';
import type { DailySpellingProgressPoint } from '@/features/analytics/types';
import { styles } from '@/features/analytics/components/DailyErrorRateChart.styles';

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
