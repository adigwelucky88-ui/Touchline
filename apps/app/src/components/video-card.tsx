import type { Video } from '@touchline/core';
import { Avatar, colors, fontSize, radius, space, Text } from '@touchline/ui';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { skillLabelKey } from '@/features/labels';

const placeholder = require('@/assets/images/football.jpg');

export function VideoCard({ video, saved, onToggleSaved }: { video: Video; saved: boolean; onToggleSaved: () => void }) {
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      {/* TODO(phase 4): open the player once videos have playback URLs. */}
      <View style={styles.thumbnail} accessibilityLabel={video.title}>
        <Image source={video.thumbnailUrl ?? placeholder} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.overlay} />
        <View style={styles.label}>
          <Text style={styles.labelText}>{t(video.playbackUrl ? 'highlights' : 'preview')}</Text>
        </View>
        <Text style={styles.season}>{video.season}</Text>
        <View style={styles.copy}>
          <Text style={styles.copyEyebrow}>
            {t(skillLabelKey(video.skill))} / {video.athleteName}
          </Text>
          <Text style={styles.copyHeadline}>{video.headline ?? video.title}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <Avatar name={video.athleteName} size={30} />
        <View style={styles.infoText}>
          <Text variant="caption" style={styles.title}>
            {video.title}
          </Text>
          <Link href={{ pathname: '/athletes/[handle]', params: { handle: video.athleteHandle } }} asChild>
            <Pressable accessibilityRole="link">
              <Text variant="caption" muted>
                {video.athleteName} ↗
              </Text>
            </Pressable>
          </Link>
          <Text variant="caption" muted>
            {video.organizationName}
          </Text>
        </View>
        <Pressable
          onPress={onToggleSaved}
          accessibilityRole="button"
          accessibilityState={{ selected: saved }}
          accessibilityLabel={t(saved ? 'remove' : 'save')}
          hitSlop={8}>
          <Text style={[styles.save, saved && styles.saved]}>{saved ? '▰' : '▱'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0 },
  thumbnail: { aspectRatio: 16 / 9, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(8,24,54,0.55)' },
  label: {
    position: 'absolute',
    top: space.md,
    left: space.md,
    backgroundColor: '#d0ddf0',
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 7,
  },
  labelText: { color: colors.accentInk, fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  season: {
    position: 'absolute',
    top: space.md,
    right: space.md,
    fontSize: fontSize.xs,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  copy: { position: 'absolute', left: space.lg, bottom: space.lg, right: space.xxxl },
  copyEyebrow: { color: '#80aced', fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  copyHeadline: { fontSize: fontSize.xl, fontWeight: '800', textTransform: 'uppercase', lineHeight: fontSize.xl * 1.05 },
  info: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, paddingTop: space.md },
  infoText: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontWeight: '600' },
  save: { fontSize: 20, color: colors.textMuted },
  saved: { color: colors.accent },
});
