import { useEffect, useState } from 'react';

import appBuildNumbers from '../../app.json';
import { getAppConfig } from '../api/apiClient';
import { AnalyticsEventName } from '../constants/AnalyticsEventName';
import { trackEvent } from '../utils/analytics';
import { isVersionLower } from '../utils/versionUtils';

type AppUpdateState = {
    recommended: boolean;
    required: boolean;
};

export const useAppUpdateCheck = () => {
    const [updateState, setUpdateState] = useState<AppUpdateState>({
        recommended: false,
        required: false,
    });
    const [dismissed, setDismissed] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAppVersion = async () => {
            try {
                const appConfig = await getAppConfig();
                if (!appConfig) return;

                const currentVersion = appBuildNumbers.expo.runtimeVersion;
                const required = isVersionLower(
                    currentVersion,
                    appConfig.requiredMinimalAppVersion,
                );
                const recommended = isVersionLower(
                    currentVersion,
                    appConfig.recommendedMinimalAppVersion,
                );

                if (!required && !recommended) return;

                trackEvent(AnalyticsEventName.UPDATE_APP_SCREEN_SHOWN, { required });
                setUpdateState({ recommended, required });
            } finally {
                setChecking(false);
            }
        };

        checkAppVersion();
    }, []);

    return {
        checking,
        dismissAskLater: () => setDismissed(true),
        showUpdateScreen: !dismissed && (updateState.required || updateState.recommended),
        updateRequired: updateState.required,
    };
};
