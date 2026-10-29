/**
 * Everything that differs between sports is described by a SportDefinition.
 * Core tables, endpoints and screens read these definitions instead of hard-coding
 * football concepts, so a new sport is new catalogue data plus translations.
 */

/** "2025/26" (football, rugby) or "2025" (cricket in many regions, athletics). */
export type SeasonFormat = 'split_year' | 'calendar_year';

export type AttributeType = 'enum' | 'number' | 'text' | 'boolean';

export interface AttributeDefinition {
  /** Stable key stored in profile_attributes, e.g. "preferred_foot". */
  key: string;
  /** i18n key for the field label. */
  labelKey: string;
  type: AttributeType;
  required: boolean;
  /** Allowed values for enum attributes; each value has its own i18n key. */
  options?: readonly { value: string; labelKey: string }[];
  min?: number;
  max?: number;
  maxLength?: number;
}

export interface Position {
  key: string;
  labelKey: string;
}

export interface SkillCategory {
  key: string;
  labelKey: string;
}

/** Words that change per sport. Values are i18n keys. */
export interface Terminology {
  team: string;
  match: string;
}

export interface SportDefinition {
  key: string;
  labelKey: string;
  enabled: boolean;
  seasonFormat: SeasonFormat;
  terminology: Terminology;
  positions: readonly Position[];
  skillCategories: readonly SkillCategory[];
  attributes: readonly AttributeDefinition[];
}
