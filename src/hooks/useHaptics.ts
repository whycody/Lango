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

    const triggerSuccessHaptics = useCallback(() => {
        if (!vibrationsEnabled) return;
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, [vibrationsEnabled]);

    const triggerStreakCelebrationHaptics = useCallback(() => {
        const pattern: Array<{ delay: number; style: HapticImpactStyle }> = [
            { delay: 0, style: 'heavy' },
            { delay: 50, style: 'heavy' },
            { delay: 100, style: 'rigid' },
            { delay: 150, style: 'rigid' },
            { delay: 200, style: 'heavy' },
        ];
        pattern.forEach(({ delay, style }) => {
            setTimeout(() => triggerHaptics(style), delay);
        });
        setTimeout(() => triggerSuccessHaptics(), 620);
    }, [triggerHaptics, triggerSuccessHaptics]);

    return { triggerHaptics, triggerStreakCelebrationHaptics, triggerSuccessHaptics };
};
