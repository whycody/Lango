import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { useUserPreferences } from "../store/UserPreferencesContext";

export const useHaptics = () => {
  const { vibrationsEnabled } = useUserPreferences();

  const triggerHaptics = useCallback(async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Rigid) => {
    if (!vibrationsEnabled) return;
    await Haptics.impactAsync(style);
  }, [vibrationsEnabled]);

  return { triggerHaptics };
};