import React from 'react';
import { View, ViewProps } from 'react-native';
import { glowShadow } from '../../theme/tokens';

interface GlowCardProps extends ViewProps {
  children: React.ReactNode;
  /** Gold border and shadow (recommended / selected card). */
  active?: boolean;
  /** 'paper' replicates the site's light sections (steps / form). */
  tone?: 'dark' | 'paper';
  className?: string;
}

/**
 * Site card: radius 24, ink-2 background, translucent border.
 * Active: 1.5px #c9a84c border with diffuse glow (DESIGN_SPEC §1.3).
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
