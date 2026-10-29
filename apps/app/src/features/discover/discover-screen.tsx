import { Button, Chip, colors, radius, space, Text, useLayoutClass } from '@touchline/ui';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AthleteTile } from '@/components/athlete-tile';
import { Screen } from '@/components/screen';
import { EmptyView, ErrorView, LoadingView, SampleDataBanner } from '@/components/state-views';
import { VideoGrid } from '@/components/video-grid';

import { useDiscoverViewModel } from './use-discover-view-model';

const heroImage = require('@/assets/images/football.jpg');

export function DiscoverScreen() {
  const vm = useDiscoverViewModel();
  const { t } = useTranslation();
  const layout = useLayoutClass();

  return (
    <Screen eyebrow={t('hero')} title={t('discover')}>
      {vm.isSampleData && <SampleDataBanner />}

      <View style={[styles.hero, layout === 'compact' && styles.heroCompact]}>
        <Image source={heroImage} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
        <View style={styles.heroShade} />
        <View style={styles.heroContent}>
          <Text variant="eyebrow" accent>
            {t('stage')}
          </Text>
          <Text variant="display">{t('hero')}</Text>
          <Text variant="display" accent>
            {t('football')}
          </Text>
          <Text muted>{t('journey')}</Text>
          <Button label={`${t('explore')} ↗`} onPress={() => router.push('/athletes')} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label={t('all')} selected={vm.selectedSkill === null} onPress={() => vm.selectSkill(null)} />
        {vm.skills.map((skill) => (
          <Chip
            key={skill.key}
            label={t(skill.labelKey)}
            selected={vm.selectedSkill === skill.key}
            onPress={() => vm.selectSkill(skill.key)}
          />
        ))}
      </ScrollView>

      <Text variant="heading">{t('highlights')}</Text>
      {vm.isLoading ? (
        <LoadingView />
      ) : vm.error ? (
        <ErrorView onRetry={vm.retry} />
      ) : vm.videos.length === 0 ? (
        <EmptyView title={t('empty')} hint={t('emptyHint')} />
      ) : (
        <VideoGrid videos={vm.videos} isSaved={vm.isSaved} onToggleSaved={vm.toggleSaved} />
      )}

      {vm.featuredAthletes.length > 0 && (
        <>
          <View style={styles.divider} />
          <Text variant="heading">{t('players')}</Text>
          <View style={styles.athletes}>
            {vm.featuredAthletes.map((athlete) => (
              <AthleteTile key={athlete.id} athlete={athlete} />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { minHeight: 360, borderRadius: radius.lg + 2, overflow: 'hidden', justifyContent: 'center', backgroundColor: colors.surface },
  heroCompact: { minHeight: 340 },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8,24,54,0.72)' },
  heroContent: { padding: space.xxl, gap: space.md, maxWidth: 660 },
  chips: { gap: space.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: space.sm },
  athletes: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
});
