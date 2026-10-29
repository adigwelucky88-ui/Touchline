import { football } from './football';
import type { AttributeDefinition, SportDefinition } from './types';

/** Built-in catalogue. The API seeds the `sports` tables from this list. */
export const SPORTS: readonly SportDefinition[] = [football];

export function getSport(key: string): SportDefinition | undefined {
  return SPORTS.find((sport) => sport.key === key);
}

export function enabledSports(): SportDefinition[] {
  return SPORTS.filter((sport) => sport.enabled);
}

export type AttributeValue = string | number | boolean;

export interface AttributeError {
  key: string;
  code: 'required' | 'unknown' | 'type' | 'option' | 'range' | 'length';
}

function checkValue(def: AttributeDefinition, value: AttributeValue): AttributeError['code'] | null {
  switch (def.type) {
    case 'enum':
      if (typeof value !== 'string') return 'type';
      return def.options?.some((option) => option.value === value) ? null : 'option';
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return 'type';
      if ((def.min !== undefined && value < def.min) || (def.max !== undefined && value > def.max)) return 'range';
      return null;
    case 'text':
      if (typeof value !== 'string') return 'type';
      return def.maxLength !== undefined && value.length > def.maxLength ? 'length' : null;
    case 'boolean':
      return typeof value === 'boolean' ? null : 'type';
  }
}

/** Validates profile attribute values against the sport's definitions. Returns [] when valid. */
export function validateAttributes(
  sport: SportDefinition,
  values: Record<string, AttributeValue | null | undefined>,
): AttributeError[] {
  const errors: AttributeError[] = [];
  for (const def of sport.attributes) {
    const value = values[def.key];
    if (value === undefined || value === null || value === '') {
      if (def.required) errors.push({ key: def.key, code: 'required' });
      continue;
    }
    const code = checkValue(def, value);
    if (code) errors.push({ key: def.key, code });
  }
  for (const key of Object.keys(values)) {
    if (!sport.attributes.some((def) => def.key === key)) errors.push({ key, code: 'unknown' });
  }
  return errors;
}
