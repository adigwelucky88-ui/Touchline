import { describe, expect, it } from 'vitest';

import { ageTier, AGE_RULES } from './age';
import { football } from './sports/football';
import { validateAttributes } from './sports/catalog';
import { isValidSeason, seasonFor } from './seasons';

describe('ageTier', () => {
  const now = new Date(Date.UTC(2026, 9, 29));

  it('counts a birthday later this year as not yet reached', () => {
    expect(ageTier(new Date(Date.UTC(2008, 10, 1)), now)).toBe('teen');
    expect(ageTier(new Date(Date.UTC(2008, 9, 29)), now)).toBe('adult');
  });

  it('maps each band to its tier', () => {
    expect(ageTier(new Date(Date.UTC(2010, 0, 1)), now)).toBe('teen');
    expect(ageTier(new Date(Date.UTC(2012, 0, 1)), now)).toBe('young_teen');
    expect(ageTier(new Date(Date.UTC(2015, 0, 1)), now)).toBe('child');
  });

  it('requires guardian consent under 16 and review for every minor', () => {
    expect(AGE_RULES.young_teen.requiresGuardianConsent).toBe(true);
    expect(AGE_RULES.teen.requiresGuardianConsent).toBe(false);
    expect(AGE_RULES.teen.uploadsRequireReview).toBe(true);
    expect(AGE_RULES.child.canSelfRegister).toBe(false);
  });
});

describe('validateAttributes', () => {
  it('accepts valid football attributes', () => {
    expect(validateAttributes(football, { preferred_foot: 'left', shirt_number: 9 })).toEqual([]);
  });

  it('reports missing, invalid and unknown attributes', () => {
    expect(validateAttributes(football, { shirt_number: 120, batting_hand: 'right' })).toEqual([
      { key: 'preferred_foot', code: 'required' },
      { key: 'shirt_number', code: 'range' },
      { key: 'batting_hand', code: 'unknown' },
    ]);
  });
});

describe('seasons', () => {
  it('validates split-year labels', () => {
    expect(isValidSeason('2025/26', 'split_year')).toBe(true);
    expect(isValidSeason('1999/00', 'split_year')).toBe(true);
    expect(isValidSeason('2025/27', 'split_year')).toBe(false);
    expect(isValidSeason('2025', 'calendar_year')).toBe(true);
  });

  it('starts split-year seasons in July', () => {
    expect(seasonFor(new Date(Date.UTC(2026, 5, 30)), 'split_year')).toBe('2025/26');
    expect(seasonFor(new Date(Date.UTC(2026, 6, 1)), 'split_year')).toBe('2026/27');
  });
});
