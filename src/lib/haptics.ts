import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Feedback tátil conforme DESIGN_SPEC §4. No-op na web, onde não há suporte.
 */
const enabled = Platform.OS !== 'web';

export const haptic = {
  /** Toque em cards, chips e acabamentos. */
  light: () => {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  /** Incrementos de dimensão e quantidade. */
  tick: () => {
    if (enabled) Haptics.selectionAsync().catch(() => {});
  },
  /** Cálculo concluído / item adicionado ao projeto. */
  success: () => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  /** Alerta de validação / erro. */
  warning: () => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
};
