import { Platform } from 'react-native';

/**
 * Design tokens for use in props that do not accept className
 * (icon colours, gradients, shadows). Mirror tailwind.config.js.
 * Sources: DESIGN_SPEC.md §1 and the CSS of qls-website-rust.vercel.app.
 */
export const colors = {
  ink: '#0e0e0e',
  ink2: '#181818',
  ink3: '#222222',
  paper: '#f6f4f0',
  text: '#f4f2ee',
  muted: 'rgba(244,242,238,0.62)',
  line: 'rgba(255,255,255,0.14)',
  lineSoft: 'rgba(255,255,255,0.08)',
  glow: '#d9b277',
  glowSoft: 'rgba(217,178,119,0.16)',
  gold: '#c9a84c',
  goldLight: '#e8b86a',
  goldDark: '#a8843a',
  ok: '#5fae78',
  warn: '#e0a64a',
  err: '#d9594c',
  info: '#6fa3d8',
};

export const fonts = {
  regular: 'Urbanist_400Regular',
  medium: 'Urbanist_500Medium',
  semibold: 'Urbanist_600SemiBold',
  bold: 'Urbanist_700Bold',
};

/** Cor aproximada da luz por temperatura de cor (DESIGN_SPEC §3.2 etapa 3 e §4). */
export function cctToColor(kelvin: number): string {
  if (kelvin <= 2700) return '#ffb45e';
  if (kelvin <= 3000) return '#ffcf94';
  if (kelvin <= 4000) return '#fff0dc';
  return '#e6f1ff';
}

export const glowShadow = Platform.select({
  web: { boxShadow: '0 0 32px rgba(217,178,119,0.28)' } as object,
  default: {
    shadowColor: '#d9b277',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  } as object,
});
