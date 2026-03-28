import {
    getAnalytics,
    logEvent,
    setUserId,
    setUserProperties,
} from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';

import { AnalyticsEventName, AnalyticsEventPayloadMap } from '../constants/AnalyticsEventName';
import { PICKED_SESSION_MODEL_VERSION } from '../constants/Session';
import { User } from '../types';
import { getCurrentStreak } from './streakUtils';

const analyticsInstance = getAnalytics(getApp());

export const trackEvent = async <T extends keyof AnalyticsEventPayloadMap>(
    eventName: T,
    ...payload: AnalyticsEventPayloadMap[T] extends undefined ? [] : [AnalyticsEventPayloadMap[T]]
) => {
    try {
        await logEvent(analyticsInstance, eventName as string, (payload[0] ?? {}) as object);
    } catch (error) {
        console.log('Analytics event error:', error);
    }
};

export const setAnalyticsUserData = async (user: User, online: boolean) => {
    if (!user.userId) return;
    try {
        await setUserId(analyticsInstance, user.userId);
        await setUserProperties(analyticsInstance, {
            current_streak: getCurrentStreak(user.stats.studyDays).numberOfDays.toString(),
            main_language: user.mainLang ?? 'none',
            notifications_enabled: user.notificationsEnabled.toString(),
            picked_session_model_version: PICKED_SESSION_MODEL_VERSION,
            provider: user.provider,
            translation_language: user.translationLang ?? 'none',
        });
        await trackEvent(AnalyticsEventName.USER_SET, { online });
    } catch (error) {
        console.log('Analytics setup error:', error);
    }
};
