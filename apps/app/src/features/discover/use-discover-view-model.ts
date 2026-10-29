import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useRepositories } from '@/data/repositories/provider';
import { useLibraryStore } from '@/state/library-store';

/** MVP ships football only; the sport becomes a user choice when more are enabled. */
const SPORT = 'football';

export function useDiscoverViewModel() {
  const { videos, sports, athletes, isSampleData } = useRepositories();
  const [skill, setSkill] = useState<string | null>(null);
  const savedVideoIds = useLibraryStore((state) => state.savedVideoIds);
  const toggleSaved = useLibraryStore((state) => state.toggleSaved);

  const sportQuery = useQuery({ queryKey: ['sport', SPORT], queryFn: () => sports.get(SPORT) });
  const videosQuery = useQuery({
    queryKey: ['videos', SPORT, skill],
    queryFn: () => videos.list({ sport: SPORT, skill: skill ?? undefined }),
  });
  const athletesQuery = useQuery({
    queryKey: ['athletes', SPORT, ''],
    queryFn: () => athletes.list({ sport: SPORT }),
  });

  return {
    skills: sportQuery.data?.skillCategories ?? [],
    selectedSkill: skill,
    selectSkill: (next: string | null) => setSkill(next),
    videos: videosQuery.data?.items ?? [],
    featuredAthletes: athletesQuery.data?.items.slice(0, 4) ?? [],
    isLoading: videosQuery.isPending,
    error: videosQuery.error,
    retry: () => videosQuery.refetch(),
    isSaved: (videoId: string) => savedVideoIds.includes(videoId),
    toggleSaved,
    isSampleData,
  };
}

export type DiscoverViewModel = ReturnType<typeof useDiscoverViewModel>;
