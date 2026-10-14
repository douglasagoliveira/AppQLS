import React from 'react';
import { View, ViewProps } from 'react-native';
import { glowShadow } from '../../theme/tokens';

interface GlowCardProps extends ViewProps {
  children: React.ReactNode;
  /** Borda e sombra douradas (card recomendado / selecionado). */
  active?: boolean;
  /** 'paper' replica as seções claras do site (steps / formulário). */
  tone?: 'dark' | 'paper';
  className?: string;
}

/**
 * Card do site: raio 24, fundo ink-2, borda translúcida.
 * Ativo: borda 1.5px #c9a84c com glow difuso (DESIGN_SPEC §1.3).
 */
export function GlowCard({
  children,
  active = false,
  tone = 'dark',
  className = '',
  style,
  ...props
}: GlowCardProps) {
  const base = tone === 'paper' ? 'bg-[#f6f4f0]' : 'bg-[#181818]';
  const border = active ? 'border-[#c9a84c]' : tone === 'paper' ? 'border-black/10' : 'border-white/[0.14]';

  return (
    <View
      className={`overflow-hidden rounded-3xl p-5 ${base} ${active ? 'border-[1.5px]' : 'border'} ${border} ${className}`}
      style={[active ? glowShadow : null, style]}
      {...props}
    >
      {children}
    </View>
  );
}
