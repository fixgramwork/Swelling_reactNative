export interface DailySpellingMetric {
  date: string;
  checkedWords: number;
  incorrectWords: number;
  correctedSentences: number;
}

export interface DailySpellingProgressPoint extends DailySpellingMetric {
  label: string;
  errorRatePercent: number;
  accuracyPercent: number;
  improvementFromPreviousPercentPoint: number | null;
}

export interface SpellingProgressSummary {
  startErrorRatePercent: number;
  currentErrorRatePercent: number;
  improvementPercentPoint: number;
  improvementRatioPercent: number;
  improvementStreakDays: number;
  averageAccuracyPercent: number;
  totalCheckedWords: number;
  totalIncorrectWords: number;
  totalCorrectedSentences: number;
}
