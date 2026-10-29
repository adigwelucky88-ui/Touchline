import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Prisma } from '../generated/prisma/client.js';
import { cursorArgs, toPage } from '../common/pagination.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { VideoDto, VideoPageDto } from './videos.dto.js';

const videoInclude = {
  profile: true,
  chapter: { include: { organization: true } },
  skills: { include: { skillCategory: true } },
} satisfies Prisma.VideoInclude;

type VideoRow = Prisma.VideoGetPayload<{ include: typeof videoInclude }>;

export interface ListVideosQuery {
  sport?: string;
  skill?: string;
  athleteHandle?: string;
  season?: string;
  cursor?: string;
  limit: number;
}

@Injectable()
export class VideosService {
  private readonly cdnUrl: string | undefined;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.cdnUrl = config.get<string>('MEDIA_CDN_URL');
  }

  private mediaUrl(key: string | null): string | null {
    return key && this.cdnUrl ? `${this.cdnUrl}/${key}` : null;
  }

  private toDto = (row: VideoRow): VideoDto => ({
    id: row.id,
    athleteId: row.profileId,
    athleteHandle: row.profile.handle,
    athleteName: row.profile.displayName,
    title: row.title,
    headline: row.headline,
    season: row.chapter?.season ?? '',
    organizationName: row.chapter?.organization.name ?? '',
    skill: row.skills[0]?.skillCategory.key ?? '',
    status: row.status,
    visibility: row.visibility,
    durationSeconds: row.durationSeconds,
    thumbnailUrl: this.mediaUrl(row.thumbnailKey),
    playbackUrl: this.mediaUrl(row.hlsManifestKey),
    createdAt: row.createdAt.toISOString(),
  });

  /** Published, public videos only. Owners' own drafts get a separate endpoint with auth. */
  async list({ sport, skill, athleteHandle, season, cursor, limit }: ListVideosQuery): Promise<VideoPageDto> {
    const rows = await this.prisma.video.findMany({
      where: {
        status: 'published',
        visibility: 'public',
        profile: { visibility: 'public', ...(sport && { sportKey: sport }), ...(athleteHandle && { handle: athleteHandle }) },
        ...(season && { chapter: { season } }),
        ...(skill && { skills: { some: { skillCategory: { key: skill } } } }),
      },
      include: videoInclude,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      ...cursorArgs(cursor, limit),
    });
    return toPage(rows, limit, this.toDto);
  }
}
