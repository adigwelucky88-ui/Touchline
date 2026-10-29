import type { SportDefinition } from './types';

export const football: SportDefinition = {
  key: 'football',
  labelKey: 'sport.football',
  enabled: true,
  seasonFormat: 'split_year',
  terminology: { team: 'term.club', match: 'term.match' },
  positions: [
    { key: 'goalkeeper', labelKey: 'goalkeeper' },
    { key: 'defender', labelKey: 'defender' },
    { key: 'midfielder', labelKey: 'midfielder' },
    { key: 'forward', labelKey: 'forward' },
  ],
  skillCategories: [
    { key: 'goals', labelKey: 'goals' },
    { key: 'assists', labelKey: 'assists' },
    { key: 'skills', labelKey: 'skills' },
    { key: 'defending', labelKey: 'defending' },
    { key: 'goalkeeping', labelKey: 'goalkeeping' },
    { key: 'full_match', labelKey: 'matches' },
  ],
  attributes: [
    {
      key: 'preferred_foot',
      labelKey: 'foot',
      type: 'enum',
      required: true,
      options: [
        { value: 'right', labelKey: 'right' },
        { value: 'left', labelKey: 'left' },
        { value: 'both', labelKey: 'both' },
      ],
    },
    { key: 'shirt_number', labelKey: 'attr.shirtNumber', type: 'number', required: false, min: 1, max: 99 },
  ],
};
