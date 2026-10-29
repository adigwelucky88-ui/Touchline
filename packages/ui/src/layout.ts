import { useEffect, useState } from 'react';
import { Platform, useWindowDimensions } from 'react-native';

import { breakpoints } from './tokens';

export type LayoutClass = 'compact' | 'medium' | 'expanded';

export function layoutClassFor(width: number): LayoutClass {
  if (width >= breakpoints.expanded) return 'expanded';
  if (width >= breakpoints.medium) return 'medium';
  return 'compact';
}

/**
 * Window width that is safe for server rendering: web pages are rendered on the server
 * without a window, so the first client render must use the same fallback (0 → compact)
 * and switch to the real width after hydration.
 */
function useHydratedWidth(): number {
  const { width } = useWindowDimensions();
  const [hydrated, setHydrated] = useState(Platform.OS !== 'web');
  useEffect(() => setHydrated(true), []);
  return hydrated ? width : 0;
}

export function useLayoutClass(): LayoutClass {
  return layoutClassFor(useHydratedWidth());
}

/** Number of grid columns for video cards at each layout class. */
export function useGridColumns(): number {
  const width = useHydratedWidth();
  if (width >= 1500) return 4;
  if (width >= breakpoints.expanded) return 3;
  if (width >= 560) return 2;
  return 1;
}
