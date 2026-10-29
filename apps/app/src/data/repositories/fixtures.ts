import { enabledSports, getSport, type Athlete, type Page, type Video } from '@touchline/core';

import type { Repositories } from './types';

/**
 * Sample data from the original prototype (fictional players). Used when no API URL is
 * configured, in tests, and for design work without a backend.
 */

const ATHLETES: Athlete[] = [
  { handle: 'ayo-martins', displayName: 'Ayo Martins', position: 'forward', country: 'NG', attributes: { preferred_foot: 'right' },
    chapters: [['2025/26', 'Lagos City FC'], ['2024/25', 'Mainland United'], ['2023/24', 'Mainland United']] },
  { handle: 'ella-brooks', displayName: 'Ella Brooks', position: 'midfielder', country: 'GB', attributes: { preferred_foot: 'left' },
    chapters: [['2025/26', 'East London Athletic'], ['2024/25', 'Northside Women']] },
  { handle: 'samuel-okoro', displayName: 'Samuel Okoro', position: 'defender', country: 'NG', attributes: { preferred_foot: 'right' },
    chapters: [['2025/26', 'Coastal Rovers'], ['2024/25', 'Lagos City FC']] },
  { handle: 'leo-ferreira', displayName: 'Leo Ferreira', position: 'goalkeeper', country: 'PT', attributes: { preferred_foot: 'right' },
    chapters: [['2025/26', 'Vila Nova Athletic'], ['2024/25', 'Vila Nova Athletic']] },
].map((athlete) => ({
  id: athlete.handle,
  handle: athlete.handle,
  displayName: athlete.displayName,
  sport: 'football',
  position: athlete.position,
  country: athlete.country,
  currentOrganization: athlete.chapters[0]?.[1] ?? null,
  attributes: athlete.attributes,
  chapters: athlete.chapters.map(([season, organizationName]) => ({
    id: `${athlete.handle}-${season}`,
    season: season!,
    organizationName: organizationName!,
    verified: false,
  })),
}));

const VIDEOS: Video[] = [
  ['v1', 'ayo-martins', 'A season of finding the net', 'Made for the moment', 'goals', '2025/26', 'Lagos City FC'],
  ['v2', 'ella-brooks', 'Seeing the pass before everyone else', 'A different vision', 'assists', '2025/26', 'East London Athletic'],
  ['v3', 'samuel-okoro', 'The art of winning it back', 'Nothing gets through', 'defending', '2025/26', 'Coastal Rovers'],
  ['v4', 'leo-ferreira', 'Big saves. Bigger moments.', 'The last line', 'goalkeeping', '2025/26', 'Vila Nova Athletic'],
  ['v5', 'ayo-martins', 'Where the journey started', 'Before the spotlight', 'skills', '2023/24', 'Mainland United'],
  ['v6', 'ella-brooks', 'One season. A new level.', 'Every touch matters', 'full_match', '2024/25', 'Northside Women'],
].map(([id, handle, title, headline, skill, season, organizationName]) => ({
  id: id!,
  athleteId: handle!,
  athleteHandle: handle!,
  athleteName: ATHLETES.find((athlete) => athlete.handle === handle)!.displayName,
  title: title!,
  headline: headline!,
  season: season!,
  organizationName: organizationName!,
  skill: skill!,
  status: 'published',
  visibility: 'public',
  durationSeconds: null,
  thumbnailUrl: null,
  playbackUrl: null,
  createdAt: '2026-10-01T00:00:00.000Z',
}));

const page = <T>(items: T[]): Page<T> => ({ items, nextCursor: null });

export const fixtureRepositories: Repositories = {
  isSampleData: true,
  videos: {
    async list({ skill }) {
      return page(VIDEOS.filter((video) => !skill || video.skill === skill));
    },
    async listForAthlete(handle, { season }) {
      return page(VIDEOS.filter((video) => video.athleteHandle === handle && (!season || video.season === season)));
    },
  },
  athletes: {
    async list({ q }) {
      const needle = q?.trim().toLocaleLowerCase();
      return page(ATHLETES.filter((athlete) => !needle || athlete.displayName.toLocaleLowerCase().includes(needle)));
    },
    async get(handle) {
      const athlete = ATHLETES.find((candidate) => candidate.handle === handle);
      if (!athlete) throw new Error(`Unknown athlete: ${handle}`);
      return athlete;
    },
  },
  sports: {
    async list() {
      return enabledSports();
    },
    async get(key) {
      const sport = getSport(key);
      if (!sport) throw new Error(`Unknown sport: ${key}`);
      return sport;
    },
  },
};
