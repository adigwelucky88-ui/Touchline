import { colors, maxContentWidth, space, Text, useLayoutClass } from '@touchline/ui';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Scrollable page body with the shared gutters, max width and optional page title. */
export function Screen({ eyebrow, title, children }: { eyebrow?: string; title?: string; children: ReactNode }) {
  const layout = useLayoutClass();
  const insets = useSafeAreaInsets();
  const gutter = layout === 'compact' ? space.lg : space.xxl;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal: gutter, paddingTop: insets.top + space.xl, paddingBottom: space.xxxl },
      ]}>
      <View style={styles.inner}>
        {(eyebrow || title) && (
          <View style={styles.header}>
            {eyebrow && (
              <Text variant="eyebrow" muted>
                {eyebrow}
              </Text>
            )}
            {title && <Text variant="title">{title}</Text>}
          </View>
        )}
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { flexGrow: 1 },
  inner: { width: '100%', maxWidth: maxContentWidth, alignSelf: 'center', gap: space.xl },
  header: { gap: space.xs },
});
