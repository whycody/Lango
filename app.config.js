export default ({config}) => {
  const isTest = process.env.EAS_BUILD_PROFILE === "test";
  const isDev = process.env.EAS_BUILD_PROFILE === "development";

  return {
    ...config,
    name: isTest ? "LangoTest" : isDev ? "LangoDev" : "Lango",
    android: {
      ...config.android,
      package: isTest ? "com.whycody.lango.test" : isDev ? 'com.whycody.lango.dev' : "com.whycody.lango",
      googleServicesFile: isTest ? "./config/google-services-test.json" : "./config/google-services.json"
    },
    ios: {
      ...config.ios,
      bundleIdentifier: isTest ? "com.whycody.lango.test" : "com.whycody.lango",
      googleServicesFile: isTest ? "./config/GoogleService-Info-Test.plist" : "./config/GoogleService-Info.plist"
    }
  };
};