import { useMemo } from 'react';
import {
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { dailySpellingMetrics } from '@/features/analytics/constants';
import { DailyErrorRateChart } from '@/features/analytics/components/DailyErrorRateChart';
import { MetricCard } from '@/features/analytics/components/MetricCard';
import { styles } from '@/features/analytics/components/SpellingProgressScreen.styles';
import {
  formatSignedPercentPoint,
  getDailySpellingProgress,
  getSpellingProgressSummary,
} from '@/features/analytics/utils';

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
