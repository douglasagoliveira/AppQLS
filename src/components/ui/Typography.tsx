import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { twMerge } from 'tailwind-merge';

export type TVariant =
  | 'display'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'lead'
  | 'body'
  | 'bodyMd'
  | 'muted'
  | 'eyebrow'
  | 'caption';

interface TProps extends TextProps {
  variant?: TVariant;
  className?: string;
}

/**
 * Type scale from DESIGN_SPEC §1.1 with the look of the QLS site
 * (headings at weight 500, elegant lead, uppercase eyebrow with wide tracking and glow colour).
 */
const VARIANTS: Record<TVariant, { cls: string; style?: TextStyle }> = {
  display: {
    cls: 'font-u-md text-[40px] leading-[42px] text-[#f4f2ee]',
    style: { letterSpacing: -1.4 },
  },
  h1: {
    cls: 'font-u-md text-[30px] leading-[34px] text-[#f4f2ee]',
    style: { letterSpacing: -0.9 },
  },
  h2: {
    cls: 'font-u-md text-[24px] leading-[28px] text-[#f4f2ee]',
    style: { letterSpacing: -0.5 },
  },
  h3: {
    cls: 'font-u-sb text-[19px] leading-[24px] text-[#f4f2ee]',
    style: { letterSpacing: -0.2 },
  },
  lead: {
    cls: 'font-u text-[16px] leading-[24px] text-[#f4f2ee]/80',
    style: { letterSpacing: -0.2 },
  },
  body: { cls: 'font-u text-[15px] leading-[23px] text-[#f4f2ee]' },
  bodyMd: { cls: 'font-u-md text-[14px] leading-[20px] text-[#f4f2ee]' },
  muted: { cls: 'font-u text-[14px] leading-[21px] text-[#f4f2ee]/60' },
  eyebrow: {
    cls: 'font-u-sb text-[11px] uppercase text-[#d9b277]',
    style: { letterSpacing: 2.4 },
  },
  caption: {
    cls: 'font-u-sb text-[12px] leading-[16px] text-[#f4f2ee]/60',
    style: { letterSpacing: 0.3 },
  },
};

export function T({ variant = 'body', className = '', style, ...props }: TProps) {
  const v = VARIANTS[variant];
  return <Text className={twMerge(v.cls, className)} style={[v.style, style]} {...props} />;
}
