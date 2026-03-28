import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

import { useUserPreferences } from '../store/UserPreferencesContext';

type HapticImpactStyle = 'heavy' | 'light' | 'medium' | 'rigid' | 'soft';

const impactStyleMap: Record<HapticImpactStyle, Haptics.ImpactFeedbackStyle> = {
    heavy: Haptics.ImpactFeedbackStyle.Heavy,
    light: Haptics.ImpactFeedbackStyle.Light,
    medium: Haptics.ImpactFeedbackStyle.Medium,
    rigid: Haptics.ImpactFeedbackStyle.Rigid,
    soft: Haptics.ImpactFeedbackStyle.Soft,
};

export const useHaptics = () => {
    const { vibrationsEnabled } = useUserPreferences();

    const triggerHaptics = useCallback(
        (style: HapticImpactStyle = 'rigid') => {
            if (!vibrationsEnabled) return;
            void Haptics.impactAsync(impactStyleMap[style]);
        },
        [vibrationsEnabled],
    );

    return { triggerHaptics };
};
