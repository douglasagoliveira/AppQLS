import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback per DESIGN_SPEC §4. No-op on web, where it is unsupported.
 */
const enabled = Platform.OS !== 'web';

export const haptic = {
  /** Taps on cards, chips and finishing touches. */
  light: () => {
    if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  },
  /** Dimension and quantity increments. */
  tick: () => {
    if (enabled) Haptics.selectionAsync().catch(() => {});
  },
  /** Calculation finished / item added to the project. */
  success: () => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
  /** Validation alert / error. */
  warning: () => {
    if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
  },
};
