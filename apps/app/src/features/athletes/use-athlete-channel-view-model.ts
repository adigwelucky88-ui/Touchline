import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useRepositories } from '@/data/repositories/provider';
import { useLibraryStore } from '@/state/library-store';

/** An athlete's channel: profile, career chapters (seasons) and the videos in the selected one. */
export function useAthleteChannelViewModel(handle: string) {
  const { athletes, videos, sports } = useRepositories();
  const [season, setSeason] = useState<string | null>(null);
  const savedVideoIds = useLibraryStore((state) => state.savedVideoIds);
  const toggleSaved = useLibraryStore((state) => state.toggleSaved);

  const athleteQuery = useQuery({ queryKey: ['athlete', handle], queryFn: () => athletes.get(handle) });
  const sportKey = athleteQuery.data?.sport;
  const sportQuery = useQuery({
    queryKey: ['sport', sportKey],
    queryFn: () => sports.get(sportKey!),
    enabled: Boolean(sportKey),
  });
  const videosQuery = useQuery({
    queryKey: ['athlete-videos', handle, season],
    queryFn: () => videos.listForAthlete(handle, { season: season ?? undefined }),
  });

  const athlete = athleteQuery.data;
  const sport = sportQuery.data;

  /** Attribute rows labelled from the sport definition, so other sports render without code changes. */
  const attributes =
    athlete && sport
      ? sport.attributes.flatMap((definition) => {
          const value = athlete.attributes[definition.key];
          if (value === undefined) return [];
          const option = definition.options?.find((candidate) => candidate.value === value);
          return [{ key: definition.key, labelKey: definition.labelKey, value: String(value), valueKey: option?.labelKey }];
        })
      : [];

  return {
    athlete,
    positionLabelKey: sport?.positions.find((position) => position.key === athlete?.position)?.labelKey,
    attributes,
    chapters: athlete?.chapters ?? [],
    selectedSeason: season,
    selectSeason: (next: string | null) => setSeason(next),
    videos: videosQuery.data?.items ?? [],
    isLoading: athleteQuery.isPending,
    error: athleteQuery.error,
    isSaved: (videoId: string) => savedVideoIds.includes(videoId),
    toggleSaved,
  };
}
