import analytics from '@react-native-firebase/analytics';
import { User } from "../types";
import { getCurrentStreak } from "./streakUtils";
import { AnalyticsEventName } from "../constants/AnalyticsEventName";

export const trackEvent = async (eventName: AnalyticsEventName, payload?: object) => {
  try {
    await analytics().logEvent(eventName, payload);
  } catch {
  }
}

export const setAnalyticsUserData = async (user: User) => {
  const { setUserId, setUserProperty } = analytics();
  await setUserId(user.userId);
  await Promise.all([
    setUserProperty('main_language', user.mainLang ?? 'none'),
    setUserProperty('translation_language', user.translationLang ?? 'none'),
    setUserProperty('provider', user.provider),
    setUserProperty('notifications_enabled', user.notificationsEnabled.toString()),
    setUserProperty('current_streak', getCurrentStreak(user.stats.studyDays).toString())
  ])
}