import { withPodfile } from '@expo/config-plugins';

const withModularHeaders = config =>
    withPodfile(config, cfg => {
        if (!cfg.modResults.contents.includes('use_modular_headers!')) {
            cfg.modResults.contents = cfg.modResults.contents.replace(
                'prepare_react_native_project!',
                'prepare_react_native_project!\n\nuse_modular_headers!',
            );
        }
        return cfg;
    });

export default ({ config }) => {
    const profile = process.env.EAS_BUILD_PROFILE || process.env.APP_VARIANT;
    const easPlatform = process.env.EAS_BUILD_PLATFORM;
    const appPlatform = process.env.APP_PLATFORM;
    const argv = process.argv.join(' ');

    const isTest = profile === 'test';
    const isDev = profile === 'development' || profile === 'dev';
    const isIos = easPlatform === 'ios' || appPlatform === 'ios' || argv.includes('--platform ios');

    return {
        ...config,
        name: isTest ? 'LangoTest' : isDev ? 'LangoDev' : 'Lango',
        ...(isIos && {
            locales: {
                en: './assets/locales/en.json',
                pl: './assets/locales/pl.json',
                es: './assets/locales/es.json',
                it: './assets/locales/it.json',
            },
        }),
        android: {
            ...config.android,
            package: isTest
                ? 'com.whycody.lango.test'
                : isDev
                  ? 'com.whycody.lango.dev'
                  : 'com.whycody.lango',
            googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? 'config/google-services.json',
        },
        ios: {
            ...config.ios,
            bundleIdentifier: 'com.whycody.lango',
            googleServicesFile:
                process.env.GOOGLE_SERVICES_IOS ?? 'config/GoogleService-Info.plist',
        },
        plugins: [
            ...(config.plugins || []),
            'expo-font',
            'expo-tracking-transparency',
            withModularHeaders,
        ],
    };
};
