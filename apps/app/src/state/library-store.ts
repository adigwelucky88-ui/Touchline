import { create } from 'zustand';

/**
 * Client-only state for Watch later until the saves endpoint exists (phase 4).
 * Held in memory, so it resets when the app restarts.
 */
interface LibraryState {
  savedVideoIds: string[];
  toggleSaved: (videoId: string) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  savedVideoIds: [],
  toggleSaved: (videoId) =>
    set((state) => ({
      savedVideoIds: state.savedVideoIds.includes(videoId)
        ? state.savedVideoIds.filter((id) => id !== videoId)
        : [...state.savedVideoIds, videoId],
    })),
}));
