import { Injectable, NotFoundException } from '@nestjs/common';
import { seasonStartYear } from '@touchline/core';

import type { Prisma } from '../generated/prisma/client.js';
import { cursorArgs, toPage } from '../common/pagination.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AthleteDto, AthletePageDto, AthleteSummaryDto } from './athletes.dto.js';

const summaryInclude = {
  position: true,
  chapters: { include: { organization: true } },
} satisfies Prisma.AthleteProfileInclude;

type SummaryRow = Prisma.AthleteProfileGetPayload<{ include: typeof summaryInclude }>;

function newestFirst<T extends { season: string }>(chapters: T[]): T[] {
  return [...chapters].sort((a, b) => seasonStartYear(b.season) - seasonStartYear(a.season));
}

function toSummary(row: SummaryRow): AthleteSummaryDto {
  return {
    id: row.id,
    handle: row.handle,
    displayName: row.displayName,
    sport: row.sportKey,
    position: row.position?.key ?? '',
    country: row.country.trim(),
    currentOrganization: newestFirst(row.chapters)[0]?.organization.name ?? null,
  };
}

export interface ListAthletesQuery {
  sport?: string;
  q?: string;
  cursor?: string;
  limit: number;
}

@Injectable()
export class AthletesService {
  constructor(private readonly prisma: PrismaService) {}

  async list({ sport, q, cursor, limit }: ListAthletesQuery): Promise<AthletePageDto> {
    // TODO(phase 2): signed-in-only profiles (minors) must be filtered by the caller's auth state.
    const rows = await this.prisma.athleteProfile.findMany({
      where: {
        visibility: 'public',
        ...(sport && { sportKey: sport }),
        ...(q && { displayName: { contains: q, mode: 'insensitive' } }),
      },
      include: summaryInclude,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      ...cursorArgs(cursor, limit),
    });
    return toPage(rows, limit, toSummary);
  }

  async getByHandle(handle: string): Promise<AthleteDto> {
    const row = await this.prisma.athleteProfile.findFirst({
      where: { handle, visibility: 'public' },
      include: { ...summaryInclude, attributes: { include: { definition: true } } },
    });
    if (!row) throw new NotFoundException(`Unknown athlete: ${handle}`);
    return {
      ...toSummary(row),
      attributes: Object.fromEntries(
        row.attributes.map((attribute) => [attribute.definition.key, attribute.value as string | number | boolean]),
      ),
      chapters: newestFirst(row.chapters).map((chapter) => ({
        id: chapter.id,
        season: chapter.season,
        organizationName: chapter.organization.name,
        verified: chapter.verifiedAt !== null,
      })),
    };
  }
}
