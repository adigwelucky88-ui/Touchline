import { useQuery } from '@tanstack/react-query';
import { useDeferredValue, useState } from 'react';

import { useRepositories } from '@/data/repositories/provider';

export function useAthletesViewModel() {
  const { athletes } = useRepositories();
  const [search, setSearch] = useState('');
  const q = useDeferredValue(search.trim());

  const query = useQuery({
    queryKey: ['athletes', 'football', q],
    queryFn: () => athletes.list({ sport: 'football', q: q || undefined }),
    placeholderData: (previous) => previous,
  });

  return {
    search,
    setSearch,
    athletes: query.data?.items ?? [],
    isLoading: query.isPending,
    error: query.error,
    retry: () => query.refetch(),
  };
}
