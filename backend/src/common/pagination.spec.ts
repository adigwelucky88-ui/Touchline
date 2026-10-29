import { BadRequestException } from '@nestjs/common';

import { cursorArgs, MAX_PAGE_SIZE, parseLimit, toPage } from './pagination.js';

describe('pagination', () => {
  it('defaults, clamps and rejects limits', () => {
    expect(parseLimit(undefined)).toBe(20);
    expect(parseLimit('500')).toBe(MAX_PAGE_SIZE);
    expect(() => parseLimit('0')).toThrow(BadRequestException);
    expect(() => parseLimit('abc')).toThrow(BadRequestException);
  });

  it('skips the cursor row and fetches one extra', () => {
    expect(cursorArgs(undefined, 10)).toEqual({ take: 11 });
    expect(cursorArgs('abc', 10)).toEqual({ cursor: { id: 'abc' }, skip: 1, take: 11 });
  });

  it('returns a next cursor only when more rows exist', () => {
    const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
    expect(toPage(rows, 2, (row) => row.id)).toEqual({ items: ['a', 'b'], nextCursor: 'b' });
    expect(toPage(rows, 3, (row) => row.id)).toEqual({ items: ['a', 'b', 'c'], nextCursor: null });
  });
});
