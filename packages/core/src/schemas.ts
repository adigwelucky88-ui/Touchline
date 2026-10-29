import { z } from 'zod';

/** Wire shapes shared by the API and clients. The API's OpenAPI document mirrors these. */

export const VideoStatus = z.enum(['uploading', 'processing', 'in_review', 'published', 'rejected', 'removed']);
export type VideoStatus = z.infer<typeof VideoStatus>;

export const Visibility = z.enum(['public', 'signed_in', 'private']);
export type Visibility = z.infer<typeof Visibility>;

export const Chapter = z.object({
  id: z.string(),
  season: z.string(),
  organizationName: z.string(),
  verified: z.boolean(),
});
export type Chapter = z.infer<typeof Chapter>;

export const AthleteSummary = z.object({
  id: z.string(),
  handle: z.string(),
  displayName: z.string(),
  sport: z.string(),
  position: z.string(),
  country: z.string(),
  currentOrganization: z.string().nullable(),
});
export type AthleteSummary = z.infer<typeof AthleteSummary>;

export const Athlete = AthleteSummary.extend({
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
  chapters: z.array(Chapter),
});
export type Athlete = z.infer<typeof Athlete>;

export const Video = z.object({
  id: z.string(),
  athleteId: z.string(),
  athleteHandle: z.string(),
  athleteName: z.string(),
  title: z.string(),
  headline: z.string().nullable(),
  season: z.string(),
  organizationName: z.string(),
  skill: z.string(),
  status: VideoStatus,
  visibility: Visibility,
  durationSeconds: z.number().nullable(),
  thumbnailUrl: z.string().nullable(),
  playbackUrl: z.string().nullable(),
  createdAt: z.string(),
});
export type Video = z.infer<typeof Video>;

export const Page = <T extends z.ZodType>(item: T) =>
  z.object({ items: z.array(item), nextCursor: z.string().nullable() });
export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}
