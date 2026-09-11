import { getStateFromPath, LinkingOptions, PathConfig } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList, ScreenName } from './navigationTypes';

const linkingConfig = {
    screens: {
        [ScreenName.BundleNavigator]: {
            path: '',
            screens: {
                [ScreenName.BundleFlashcards]: 'bundle/:bundleId',
            },
        } as PathConfig<RootStackParamList>,
    },
};

export const linking: LinkingOptions<RootStackParamList> = {
    config: linkingConfig,
    // React Navigation's default getInitialURL races Linking.getInitialURL()
    // against a 150ms timeout (a workaround for an old RN bug) and silently
    // drops the link if the native bridge hasn't resolved it in time yet -
    // which is common on a cold start. Override it to wait indefinitely.
    getInitialURL: () => Linking.getInitialURL(),

    getStateFromPath(path, options) {
        const state = getStateFromPath(path, options);
        if (!state) return state;

        // Deep-linking straight into a bundle should still leave the Bundles
        // tab underneath on the stack, so back navigation lands on the
        // bundles list instead of exiting the app.
        const bundleRoute = state.routes.find(route => route.name === ScreenName.BundleNavigator);
        if (!bundleRoute) return state;

        return {
            ...state,
            index: 1,
            routes: [
                {
                    key: `Tabs-${Date.now()}`,
                    name: ScreenName.Tabs,
                    state: {
                        index: 1,
                        routes: [{ name: 'Home' }, { name: 'Bundles' }],
                    },
                },
                bundleRoute,
            ],
        };
    },
    prefixes: [Linking.createURL('/'), 'https://app.lango.ovh'],
};
