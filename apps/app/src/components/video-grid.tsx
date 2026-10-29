import type { Video } from '@touchline/core';
import { space, useGridColumns } from '@touchline/ui';
import { StyleSheet, View } from 'react-native';

import { VideoCard } from './video-card';

/** Responsive grid: 1 column on small phones up to 4 on wide desktop web. */
export function VideoGrid({
  videos,
  isSaved,
  onToggleSaved,
}: {
  videos: Video[];
  isSaved: (id: string) => boolean;
  onToggleSaved: (id: string) => void;
}) {
  const columns = useGridColumns();
  const rows: Video[][] = [];
  for (let i = 0; i < videos.length; i += columns) rows.push(videos.slice(i, i + columns));

  return (
    <View style={styles.grid}>
      {rows.map((row) => (
        <View key={row[0]!.id} style={styles.row}>
          {row.map((video) => (
            <VideoCard key={video.id} video={video} saved={isSaved(video.id)} onToggleSaved={() => onToggleSaved(video.id)} />
          ))}
          {Array.from({ length: columns - row.length }, (_, i) => (
            <View key={`spacer-${i}`} style={styles.spacer} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: space.xl },
  row: { flexDirection: 'row', gap: space.lg },
  spacer: { flex: 1 },
});
