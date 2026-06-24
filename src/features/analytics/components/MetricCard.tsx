import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../../theme';

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  tone?: 'blue' | 'green' | 'orange' | 'gray';
}

function getToneColor(tone: NonNullable<MetricCardProps['tone']>) {
  if (tone === 'green') {
    return colors.success;
  }

  if (tone === 'orange') {
    return colors.warning;
  }

  if (tone === 'gray') {
    return colors.gray600;
  }

  return colors.primary;
}

export function MetricCard({ label, value, detail, tone = 'blue' }: MetricCardProps) {
  const toneColor = getToneColor(tone);

  return (
    <View style={styles.card}>
      <Text numberOfLines={1} style={styles.label}>
        {label}
      </Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        selectable
        style={[styles.value, { color: toneColor }]}
      >
        {value}
      </Text>
      <Text numberOfLines={2} style={styles.detail}>
        {detail}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: colors.borderLight,
    borderCurve: 'continuous',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    gap: spacing.xs,
    minHeight: 118,
    minWidth: 0,
    padding: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 18,
  },
  value: {
    fontSize: typography.fontSize.xxl,
    fontVariant: ['tabular-nums'],
    fontWeight: typography.fontWeight.bold,
    lineHeight: 31,
  },
  detail: {
    color: colors.textTertiary,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    lineHeight: 17,
  },
});
