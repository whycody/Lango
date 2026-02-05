export default ({config}) => {
  const isTest = process.env.EAS_BUILD_PROFILE === "test";
  const isDev = process.env.EAS_BUILD_PROFILE === "development";

  return {
    ...config,
    name: isTest ? "LangoTest" : isDev ? "LangoDev" : "Lango",
    android: {
      ...config.android,
      package: isTest ? "com.whycody.lango.test" : isDev ? "com.whycody.lango.dev" : "com.whycody.lango",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON
    },
    ios: {
      ...config.ios,
      bundleIdentifier: isTest ? "com.whycody.lango.test" : isDev ? "com.whycody.lango.dev" : "com.whycody.lango",
      googleServicesFile: isTest ? process.env.GOOGLE_SERVICES_IOS_TEST : isDev ? process.env.GOOGLE_SERVICES_IOS_DEV : process.env.GOOGLE_SERVICES_IOS
    }
  };
};