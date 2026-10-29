import type { Athlete, AthleteSummary, Page, SportDefinition, Video } from '@touchline/core';

/**
 * Repositories are the only layer that knows where data comes from.
 * ViewModels depend on these interfaces, never on a concrete implementation.
 */

export interface VideoQuery {
  sport?: string;
  skill?: string;
  cursor?: string;
}

export interface VideoRepository {
  list(query: VideoQuery): Promise<Page<Video>>;
  listForAthlete(handle: string, query: { season?: string; cursor?: string }): Promise<Page<Video>>;
}

export interface AthleteRepository {
  list(query: { sport?: string; q?: string; cursor?: string }): Promise<Page<AthleteSummary>>;
  get(handle: string): Promise<Athlete>;
}

export interface SportRepository {
  list(): Promise<SportDefinition[]>;
  get(key: string): Promise<SportDefinition>;
}

export interface Repositories {
  videos: VideoRepository;
  athletes: AthleteRepository;
  sports: SportRepository;
  /** True when running on built-in sample data instead of the API. */
  isSampleData: boolean;
}
