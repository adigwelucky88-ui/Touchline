import { BadRequestException } from '@nestjs/common';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

export function parseLimit(raw: string | undefined): number {
  if (raw === undefined || raw === '') return DEFAULT_PAGE_SIZE;
  const limit = Number(raw);
  if (!Number.isInteger(limit) || limit < 1) throw new BadRequestException('limit must be a positive integer');
  return Math.min(limit, MAX_PAGE_SIZE);
}

/**
 * Prisma cursor arguments for keyset pagination by id. Fetches one extra row so
 * `toPage` can tell whether another page exists.
 */
export function cursorArgs(
  cursor: string | undefined,
  limit: number,
): { cursor?: { id: string }; skip?: number; take: number } {
  return cursor ? { cursor: { id: cursor }, skip: 1, take: limit + 1 } : { take: limit + 1 };
}

export function toPage<T extends { id: string }, R>(rows: T[], limit: number, map: (row: T) => R) {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return { items: items.map(map), nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null };
}
