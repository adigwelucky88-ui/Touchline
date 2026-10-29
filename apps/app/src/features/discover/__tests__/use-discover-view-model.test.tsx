import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { fixtureRepositories } from '@/data/repositories/fixtures';
import { RepositoryProvider } from '@/data/repositories/provider';
import { useLibraryStore } from '@/state/library-store';

import { useDiscoverViewModel } from '../use-discover-view-model';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  return (
    <QueryClientProvider client={client}>
      <RepositoryProvider value={fixtureRepositories}>{children}</RepositoryProvider>
    </QueryClientProvider>
  );
}

describe('useDiscoverViewModel', () => {
  beforeEach(() => useLibraryStore.setState({ savedVideoIds: [] }));

  it('loads skills from the sport catalogue and all videos', async () => {
    const { result } = await renderHook(() => useDiscoverViewModel(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.skills.map((skill) => skill.key)).toContain('goalkeeping');
    expect(result.current.videos).toHaveLength(6);
    expect(result.current.isSampleData).toBe(true);
  });

  it('filters by the selected skill', async () => {
    const { result } = await renderHook(() => useDiscoverViewModel(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(() => result.current.selectSkill('goals'));
    await waitFor(() => expect(result.current.videos.map((video) => video.id)).toEqual(['v1']));
  });

  it('toggles Watch later', async () => {
    const { result } = await renderHook(() => useDiscoverViewModel(), { wrapper });
    await act(() => result.current.toggleSaved('v2'));
    expect(result.current.isSaved('v2')).toBe(true);
    await act(() => result.current.toggleSaved('v2'));
    expect(result.current.isSaved('v2')).toBe(false);
  });
});
