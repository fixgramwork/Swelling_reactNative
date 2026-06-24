import type {
  DailySpellingMetric,
  DailySpellingProgressPoint,
  SpellingProgressSummary,
} from './types';

function roundToOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function getErrorRatePercent(metric: DailySpellingMetric) {
  if (metric.checkedWords <= 0) {
    return 0;
  }

  return roundToOne((metric.incorrectWords / metric.checkedWords) * 100);
}

export function getAccuracyPercent(metric: DailySpellingMetric) {
  return roundToOne(100 - getErrorRatePercent(metric));
}

export function formatDailyLabel(date: string) {
  const [, month, day] = date.split('-');

  if (!month || !day) {
    return date;
  }

  return `${Number(month)}/${Number(day)}`;
}

export function getDailySpellingProgress(
  metrics: DailySpellingMetric[],
): DailySpellingProgressPoint[] {
  return metrics.map((metric, index) => {
    const errorRatePercent = getErrorRatePercent(metric);
    const previousMetric = metrics[index - 1];
    const previousErrorRate = previousMetric
      ? getErrorRatePercent(previousMetric)
      : null;

    return {
      ...metric,
      label: formatDailyLabel(metric.date),
      errorRatePercent,
      accuracyPercent: getAccuracyPercent(metric),
      improvementFromPreviousPercentPoint:
        previousErrorRate === null
          ? null
          : roundToOne(previousErrorRate - errorRatePercent),
    };
  });
}

export function getImprovementStreakDays(metrics: DailySpellingMetric[]) {
  let streak = 0;

  for (let index = metrics.length - 1; index > 0; index -= 1) {
    const currentRate = getErrorRatePercent(metrics[index]);
    const previousRate = getErrorRatePercent(metrics[index - 1]);

    if (currentRate >= previousRate) {
      break;
    }

    streak += 1;
  }

  return streak;
}

export function getSpellingProgressSummary(
  metrics: DailySpellingMetric[],
): SpellingProgressSummary {
  const firstMetric = metrics[0];
  const latestMetric = metrics[metrics.length - 1];
  const totalCheckedWords = metrics.reduce(
    (total, metric) => total + metric.checkedWords,
    0,
  );
  const totalIncorrectWords = metrics.reduce(
    (total, metric) => total + metric.incorrectWords,
    0,
  );
  const totalCorrectedSentences = metrics.reduce(
    (total, metric) => total + metric.correctedSentences,
    0,
  );
  const startErrorRatePercent = firstMetric ? getErrorRatePercent(firstMetric) : 0;
  const currentErrorRatePercent = latestMetric
    ? getErrorRatePercent(latestMetric)
    : 0;
  const improvementPercentPoint = roundToOne(
    startErrorRatePercent - currentErrorRatePercent,
  );
  const improvementRatioPercent =
    startErrorRatePercent > 0
      ? roundToOne((improvementPercentPoint / startErrorRatePercent) * 100)
      : 0;
  const averageErrorRatePercent =
    totalCheckedWords > 0
      ? roundToOne((totalIncorrectWords / totalCheckedWords) * 100)
      : 0;

  return {
    startErrorRatePercent,
    currentErrorRatePercent,
    improvementPercentPoint,
    improvementRatioPercent,
    improvementStreakDays: getImprovementStreakDays(metrics),
    averageAccuracyPercent: roundToOne(100 - averageErrorRatePercent),
    totalCheckedWords,
    totalIncorrectWords,
    totalCorrectedSentences,
  };
}

export function formatSignedPercentPoint(value: number) {
  if (value === 0) {
    return '0.0%p';
  }

  const sign = value > 0 ? '-' : '+';

  return `${sign}${Math.abs(value).toFixed(1)}%p`;
}
