import {
  getAnalytics,
  logEvent as logAnalyticsEvent,
  setUserId,
  setUserProperties
} from '@react-native-firebase/analytics';
import { getApp } from '@react-native-firebase/app';
import { PICKED_SESSION_MODEL_VERSION, User } from "../types";
import { getCurrentStreak } from "./streakUtils";
import { AnalyticsEventName, AnalyticsEventPayloadMap } from "../constants/AnalyticsEventName";

const analyticsInstance = getAnalytics(getApp());

export const trackEvent = async <T extends AnalyticsEventName>(
  eventName: T,
  ...payload: AnalyticsEventPayloadMap[T] extends undefined ? [] : [AnalyticsEventPayloadMap[T]]
) => {
  try {
    await logAnalyticsEvent(
      analyticsInstance,
      eventName as string,
      (payload[0] ?? {}) as object
    );
  } catch (error) {
    console.log('Analytics event error:', error);
  }
};

export const setAnalyticsUserData = async (user: User, online: boolean) => {
  try {
    await setUserId(analyticsInstance, user.userId);
    await setUserProperties(analyticsInstance, {
      main_language: user.mainLang ?? 'none',
      translation_language: user.translationLang ?? 'none',
      provider: user.provider,
      notifications_enabled: user.notificationsEnabled.toString(),
      current_streak: getCurrentStreak(user.stats.studyDays).numberOfDays.toString(),
      picked_session_model_version: PICKED_SESSION_MODEL_VERSION,
    })
    await trackEvent(AnalyticsEventName.USER_SET, { online });
  } catch (error) {
    console.log('Analytics setup error:', error);
  }
};