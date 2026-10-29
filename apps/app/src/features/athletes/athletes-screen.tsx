import { colors, radius, space } from '@touchline/ui';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View } from 'react-native';

import { AthleteTile } from '@/components/athlete-tile';
import { Screen } from '@/components/screen';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';

import { useAthletesViewModel } from './use-athletes-view-model';

export function AthletesScreen() {
  const vm = useAthletesViewModel();
  const { t } = useTranslation();

  return (
    <Screen eyebrow={t('hero')} title={t('players')}>
      <TextInput
        value={vm.search}
        onChangeText={vm.setSearch}
        placeholder={t('search')}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('search')}
        autoCorrect={false}
        style={styles.search}
      />
      {vm.isLoading ? (
        <LoadingView />
      ) : vm.error ? (
        <ErrorView onRetry={vm.retry} />
      ) : vm.athletes.length === 0 ? (
        <EmptyView title={t('empty')} hint={t('emptyHint')} />
      ) : (
        <View style={styles.grid}>
          {vm.athletes.map((athlete) => (
            <AthleteTile key={athlete.id} athlete={athlete} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    color: colors.text,
    maxWidth: 480,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
});
