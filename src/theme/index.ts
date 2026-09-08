/**
 * Shares its palette with docs/lora-mesh-architecture.pdf so the app and
 * the architecture docs read as the same product.
 */
export const colors = {
  bg: '#EEF3F5',
  surface: '#FFFFFF',
  surfaceAlt: '#E1EBEE',
  ink: '#16323F',
  inkMuted: '#4C6B78',
  line: '#C7D6DB',
  accent: '#B5651D',
  accentSoft: '#F3E1CC',
  good: '#3F7A5C',
  bad: '#9C3F32',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 20,
  pill: 999,
};

export const typography = {
  title: {fontSize: 24, fontWeight: '700' as const, color: colors.ink},
  subtitle: {fontSize: 15, color: colors.inkMuted},
  body: {fontSize: 15, color: colors.ink},
  label: {fontSize: 12, fontWeight: '600' as const, color: colors.accent, letterSpacing: 0.6},
};
