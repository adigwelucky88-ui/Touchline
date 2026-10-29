import { useQuery } from '@tanstack/react-query';

import { useRepositories } from '@/data/repositories/provider';
import { useLibraryStore } from '@/state/library-store';

export function useSavedViewModel() {
  const { videos } = useRepositories();
  const savedVideoIds = useLibraryStore((state) => state.savedVideoIds);
  const toggleSaved = useLibraryStore((state) => state.toggleSaved);

  // Until the saves endpoint exists, filter the Discover feed client-side.
  const query = useQuery({ queryKey: ['videos', 'football', null], queryFn: () => videos.list({ sport: 'football' }) });

  return {
    videos: (query.data?.items ?? []).filter((video) => savedVideoIds.includes(video.id)),
    isLoading: query.isPending,
    isSaved: (videoId: string) => savedVideoIds.includes(videoId),
    toggleSaved,
  };
}
