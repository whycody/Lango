import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';

import { AnalyticsEventName } from '../constants/AnalyticsEventName';
import { trackEvent } from './analytics';

export async function checkUpdates() {
    try {
        trackEvent(AnalyticsEventName.CHECK_UPDATES);
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
            await SplashScreen.preventAutoHideAsync();
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
            trackEvent(AnalyticsEventName.UPDATE_SUCCESS);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        trackEvent(AnalyticsEventName.UPDATE_FAILURE, { reason: errorMessage });
    } finally {
        await SplashScreen.hideAsync();
    }
}
