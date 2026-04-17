export default ({ config }) => {
    const profile = process.env.EAS_BUILD_PROFILE || process.env.APP_VARIANT;

    const isTest = profile === 'test';
    const isDev = profile === 'development' || profile === 'dev';

    return {
        ...config,
        name: isTest ? 'LangoTest' : isDev ? 'LangoDev' : 'Lango',
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
            bundleIdentifier: isTest
                ? 'com.whycody.lango.test'
                : isDev
                  ? 'com.whycody.lango.dev'
                  : 'com.whycody.lango',
            googleServicesFile: isTest
                ? (process.env.GOOGLE_SERVICES_IOS_TEST ?? 'config/GoogleService-Info-Test.plist')
                : isDev
                  ? (process.env.GOOGLE_SERVICES_IOS_DEV ?? 'config/GoogleService-Info-Dev.plist')
                  : (process.env.GOOGLE_SERVICES_IOS ?? 'config/GoogleService-Info.plist'),
        },
        plugins: [...(config.plugins || []), 'expo-font'],
    };
};
