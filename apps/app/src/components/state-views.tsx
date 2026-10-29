import { Button, Card, colors, space, Text } from '@touchline/ui';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export function LoadingView() {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

export function ErrorView({ onRetry }: { onRetry?: () => void }) {
  const { t } = useTranslation();
  return (
    <Card style={styles.message}>
      <Text variant="heading">{t('saveError')}</Text>
      {onRetry && <Button label="↻" variant="secondary" onPress={onRetry} accessibilityLabel="Retry" />}
    </Card>
  );
}

export function EmptyView({ title, hint }: { title: string; hint?: string }) {
  return (
    <Card style={[styles.message, styles.dashed]}>
      <Text variant="heading">{title}</Text>
      {hint && <Text muted>{hint}</Text>}
    </Card>
  );
}

/** Shown while the app runs on built-in sample data instead of the API. */
export function SampleDataBanner() {
  const { t } = useTranslation();
  return (
    <View style={styles.banner}>
      <Text variant="caption" accent>
        {t('sampleData')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { paddingVertical: space.xxxl, alignItems: 'center' },
  message: { alignItems: 'center', gap: space.md, paddingVertical: space.xxxl },
  dashed: { borderStyle: 'dashed' },
  banner: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 4,
    paddingVertical: space.xs,
    paddingHorizontal: space.sm,
  },
});
