import { football } from '@touchline/core';

/**
 * Label helpers for catalogue keys. They read the sport definition, so translations stay
 * keyed by the catalogue rather than by football-specific strings in screens.
 * TODO: take the sport from the item once more than football is enabled.
 */

export function skillLabelKey(skill: string): string {
  return football.skillCategories.find((category) => category.key === skill)?.labelKey ?? skill;
}

export function positionLabelKey(position: string): string {
  return football.positions.find((candidate) => candidate.key === position)?.labelKey ?? position;
}

/** Localised country name from an ISO code; falls back to the code where Intl lacks DisplayNames. */
export function countryName(code: string, language: string): string {
  try {
    return new Intl.DisplayNames([language], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}
