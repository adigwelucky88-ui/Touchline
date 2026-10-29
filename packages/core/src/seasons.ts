import type { SeasonFormat } from './sports/types';

const SPLIT_YEAR = /^(\d{4})\/(\d{2})$/;
const CALENDAR_YEAR = /^\d{4}$/;

/** "2025/26" is valid only when the second year follows the first. */
export function isValidSeason(label: string, format: SeasonFormat): boolean {
  if (format === 'calendar_year') return CALENDAR_YEAR.test(label);
  const match = SPLIT_YEAR.exec(label);
  if (!match) return false;
  const start = Number(match[1]);
  return (start + 1) % 100 === Number(match[2]);
}

/** Season label containing the given date. Split-year seasons start on 1 July. */
export function seasonFor(date: Date, format: SeasonFormat): string {
  const year = date.getUTCFullYear();
  if (format === 'calendar_year') return String(year);
  const start = date.getUTCMonth() >= 6 ? year : year - 1;
  return `${start}/${String((start + 1) % 100).padStart(2, '0')}`;
}

/** Sort key so seasons of either format order newest first with a plain descending sort. */
export function seasonStartYear(label: string): number {
  return Number(label.slice(0, 4));
}
