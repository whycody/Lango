export default ({ config }) => {
  const isTest = process.env.EAS_BUILD_PROFILE === "test";

  return {
    ...config,
    name: isTest ? "LangoTest" : "Lango",
    android: {
      ...config.android,
      package: isTest ? "com.whycody.lango.test" : "com.whycody.lango"
    }
  };
};