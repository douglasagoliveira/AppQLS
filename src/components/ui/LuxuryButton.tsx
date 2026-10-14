import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, TextStyle, View } from 'react-native';
import { twMerge } from 'tailwind-merge';
import { haptic } from '../../lib/haptics';
import { T } from './Typography';

export type ButtonVariant = 'primary' | 'glow' | 'outline' | 'dark';

interface LuxuryButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  loading?: boolean;
  className?: string;
  textClassName?: string;
  textStyle?: TextStyle;
}

/**
 * Botão-pílula (raio 999, DESIGN_SPEC §1.3) com os estilos do site:
 * primary = btn-light (papel), glow = destaque dourado, outline = btn padrão.
 * Cores de alto contraste garantem legibilidade AAA em qualquer plataforma.
 */
const STYLES: Record<
  ButtonVariant,
  { box: string; text: string; loader: string; textColor: string; iconColor: string }
> = {
  primary: {
    box: 'bg-[#f6f4f0] border-[#f6f4f0] active:bg-white',
    text: 'text-[#111111]',
    loader: '#111111',
    textColor: '#111111',
    iconColor: '#111111',
  },
  glow: {
    box: 'bg-[#d9b277] border-[#d9b277] active:bg-[#e8c48f]',
    text: 'text-[#111111]',
    loader: '#111111',
    textColor: '#111111',
    iconColor: '#111111',
  },
  outline: {
    box: 'bg-transparent border-white/20 active:bg-white/5',
    text: 'text-[#f4f2ee]',
    loader: '#f4f2ee',
    textColor: '#f4f2ee',
    iconColor: '#f4f2ee',
  },
  dark: {
    box: 'bg-[#181818] border-white/15 active:bg-[#222222]',
    text: 'text-[#f4f2ee]',
    loader: '#f4f2ee',
    textColor: '#f4f2ee',
    iconColor: '#f4f2ee',
  },
};

export function LuxuryButton({
  title,
  variant = 'primary',
  icon,
  loading = false,
  className = '',
  textClassName = '',
  textStyle,
  disabled,
  onPress,
  ...props
}: LuxuryButtonProps) {
  const s = STYLES[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      disabled={isDisabled}
      onPress={(e) => {
        haptic.light();
        onPress?.(e);
      }}
      className={twMerge(
        'flex-row items-center justify-center gap-2 rounded-full border px-6 py-3.5',
        s.box,
        isDisabled ? 'opacity-50' : '',
        className
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={s.loader} />
      ) : (
        <>
          {icon ? (
            <View>
              {React.isValidElement(icon) && !(icon.props as { color?: string })?.color
                ? React.cloneElement(icon as React.ReactElement<{ color?: string }>, {
                    color: s.iconColor,
                  })
                : icon}
            </View>
          ) : null}
          <T
            variant="bodyMd"
            className={twMerge('font-u-sb text-[15px]', s.text, textClassName)}
            style={[{ color: s.textColor }, textStyle]}
          >
            {title}
          </T>
        </>
      )}
    </Pressable>
  );
}
