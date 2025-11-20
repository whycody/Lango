import { Image, Platform, StyleSheet } from "react-native";
import CustomText from "./CustomText";
import { useTheme } from "@react-navigation/native";
import appBuildNumbers from "../../../app.json";

const VersionFooter = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const buildNumber = Platform.OS === 'ios' ? appBuildNumbers.expo.ios.buildNumber : appBuildNumbers.expo.android.versionCode;
  const runtimeVersion = appBuildNumbers.expo.runtimeVersion;

  return (
    <>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <CustomText style={styles.version}>
        {`${runtimeVersion}.${buildNumber}`}
      </CustomText>
    </>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  image: {
    height: 40,
    alignSelf: 'center',
    marginTop: 30,
  },
  version: {
    color: colors.text,
    marginTop: 10,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14
  }
});

export default VersionFooter;