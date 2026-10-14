import React from 'react';
import { View } from 'react-native';
import { T } from './Typography';

interface StandardsBadgeProps {
  type?: 'standard' | 'cct' | 'cri' | 'ip' | 'lux' | 'tier' | 'status';
  label: string;
  value?: string | number;
  highlight?: boolean;
}

/**
 * Chip técnico estilo `.specs li` do site (borda fina, pílula).
 * `highlight` marca conformidade AS/NZS / destaque dourado.
 */
export function StandardsBadge({ label, value, highlight = false }: StandardsBadgeProps) {
  return (
    <View
      className={`flex-row items-center rounded-full border px-3 py-1 ${
        highlight ? 'border-[#d9b277]/50 bg-[#d9b277]/10' : 'border-white/[0.14] bg-transparent'
      }`}
    >
      <T variant="caption" className={highlight ? 'text-[#d9b277]' : 'text-[#f4f2ee]/70'}>
        {label}
        {value !== undefined ? <T variant="caption" className="font-u-b text-[#f4f2ee]">{` ${value}`}</T> : null}
      </T>
    </View>
  );
}
