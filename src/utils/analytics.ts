import analytics from '@react-native-firebase/analytics';
import { PICKED_SESSION_MODEL_VERSION, User } from "../types";
import { getCurrentStreak } from "./streakUtils";
import { AnalyticsEventName, AnalyticsEventPayloadMap } from "../constants/AnalyticsEventName";
import * as Updates from "expo-updates";

const isTest = (!Updates.channel || ['test', 'development'].includes(Updates.channel))

export const trackEvent = async <T extends AnalyticsEventName>(
  eventName: T,
  ...payload: AnalyticsEventPayloadMap[T] extends undefined ? [] : [AnalyticsEventPayloadMap[T]]
) => {
  if (isTest) return;

  try {
    await analytics().logEvent(
      eventName,
      (payload[0] ?? {}) as object
    );
  } catch {

  }
};

export const setAnalyticsUserData = async (user: User, online: boolean) => {
  if (isTest) return;

  const { setUserId, setUserProperty } = analytics();
  await Promise.all([
    trackEvent(AnalyticsEventName.USER_SET, { online }),
    setUserId(user.userId),
    setUserProperty('main_language', user.mainLang ?? 'none'),
    setUserProperty('translation_language', user.translationLang ?? 'none'),
    setUserProperty('provider', user.provider),
    setUserProperty('notifications_enabled', user.notificationsEnabled.toString()),
    setUserProperty('current_streak', getCurrentStreak(user.stats.studyDays).toString()),
    setUserProperty('picked_session_model_version', PICKED_SESSION_MODEL_VERSION)
  ])
}