/**
 * Design tokens taken from the prototype's black canvas with blue accents
 * (prototype/style.css). Every component reads these; nothing hard-codes colours.
 */

export const colors = {
  canvas: '#000000',
  surface: '#10141b',
  surfaceRaised: '#111821',
  border: '#26303e',
  borderStrong: '#2b3a4e',
  text: '#f4f7fc',
  textMuted: '#a4b6cf',
  accent: '#a9d9ff',
  accentStrong: '#2563eb',
  accentInk: '#141920',
  selected: '#16355d',
  selectedText: '#c5e5ff',
  selectedBorder: '#4c9bff',
  badge: '#18314e',
  heroOverlay: 'rgba(8,24,54,0.9)',
  danger: '#f87171',
} as const;

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radius = { sm: 4, md: 7, lg: 10, xl: 14, pill: 999 } as const;

export const fontSize = { xs: 10, sm: 12, md: 14, lg: 17, xl: 22, xxl: 32, display: 44 } as const;

/**
 * Width breakpoints for the adaptive shell:
 * compact = phones (bottom tabs), medium = tablets/iPad portrait (rail),
 * expanded = tablet landscape and desktop web (sidebar).
 */
export const breakpoints = { medium: 768, expanded: 1200 } as const;

export const maxContentWidth = 1600;
