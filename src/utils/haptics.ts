import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

const safe = (fn: () => Promise<unknown>) => {
  if (!supported) return;
  fn().catch(() => {});
};

/** Soft, kid-friendly tactile feedback. All calls are no-ops on web. */
export const haptics = {
  tap: () => safe(() => Haptics.selectionAsync()),
  match: (combo: number) =>
    safe(() =>
      Haptics.impactAsync(
        combo >= 3 ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
      )
    ),
  blast: () => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () =>
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  bump: () =>
    safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
};
