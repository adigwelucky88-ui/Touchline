import { Avatar, Badge, Button, colors, radius, space, Text } from '@touchline/ui';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { EmptyView, ErrorView, LoadingView } from '@/components/state-views';
import { VideoGrid } from '@/components/video-grid';
import { countryName } from '@/features/labels';

import { useAthleteChannelViewModel } from './use-athlete-channel-view-model';

export function AthleteChannelScreen({ handle }: { handle: string }) {
  const vm = useAthleteChannelViewModel(handle);
  const { t, i18n } = useTranslation();
  const { athlete } = vm;

  return (
    <Screen>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/athletes'))} accessibilityRole="button">
        <Text variant="caption" muted>
          ← {t('players')}
        </Text>
      </Pressable>

      {vm.isLoading ? (
        <LoadingView />
      ) : vm.error || !athlete ? (
        <ErrorView />
      ) : (
        <>
          <View style={styles.banner}>
            <Avatar name={athlete.displayName} size={80} />
            <View style={styles.bannerText}>
              <Text variant="eyebrow" muted>
                {t('archive')}
              </Text>
              <Text variant="title">{athlete.displayName}</Text>
              <Text variant="caption" muted>
                {vm.positionLabelKey ? t(vm.positionLabelKey) : athlete.position} · {athlete.currentOrganization} ·{' '}
                {countryName(athlete.country, i18n.language)}
              </Text>
            </View>
            {/* TODO(phase 4): follow requires sign-in. */}
            <Button label={t('follow')} />
          </View>

          <View style={styles.badges}>
            {vm.attributes.map((attribute) => (
              <Badge
                key={attribute.key}
                label={`${t(attribute.labelKey)}: ${attribute.valueKey ? t(attribute.valueKey) : attribute.value}`}
              />
            ))}
          </View>

          <Text variant="heading">{t('archive')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeline}>
            <SeasonButton label={t('entire')} selected={vm.selectedSeason === null} onPress={() => vm.selectSeason(null)} />
            {vm.chapters.map((chapter) => (
              <SeasonButton
                key={chapter.id}
                label={chapter.season}
                detail={chapter.organizationName}
                selected={vm.selectedSeason === chapter.season}
                onPress={() => vm.selectSeason(chapter.season)}
              />
            ))}
          </ScrollView>

          {vm.videos.length === 0 ? (
            <EmptyView title={t('noVideos')} />
          ) : (
            <VideoGrid videos={vm.videos} isSaved={vm.isSaved} onToggleSaved={vm.toggleSaved} />
          )}
        </>
      )}
    </Screen>
  );
}

function SeasonButton({
  label,
  detail,
  selected,
  onPress,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.season, selected && styles.seasonSelected]}>
      <Text variant="caption" style={styles.seasonLabel}>
        {label}
      </Text>
      {detail && (
        <Text variant="caption" muted>
          {detail}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.xxl,
  },
  bannerText: { flex: 1, minWidth: 200, gap: space.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  timeline: { gap: space.lg },
  season: {
    minWidth: 150,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: space.md + 2,
    paddingHorizontal: space.xl,
    gap: space.xs,
  },
  seasonSelected: { borderColor: colors.selectedBorder, backgroundColor: colors.selected },
  seasonLabel: { fontWeight: '700' },
});
