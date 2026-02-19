import { Image, Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import CustomText from "./CustomText";
import { useTheme } from "@react-navigation/native";
import appBuildNumbers from "../../../app.json";
import { FC } from "react";

type VersionFooterProps = {
  small?: boolean;
  style?: StyleProp<ViewStyle>;
};

const VersionFooter: FC<VersionFooterProps> = ({ small = false, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const buildNumber = Platform.OS === 'ios' ? appBuildNumbers.expo.ios.buildNumber : appBuildNumbers.expo.android.versionCode;
  const runtimeVersion = appBuildNumbers.expo.runtimeVersion;

  return (
    <View style={style}>
      {!small &&
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.image}
          resizeMode="contain"
        />
      }
      <CustomText style={[styles.version, small && styles.smallVersion]}>
        {`${runtimeVersion}.${buildNumber}`}
      </CustomText>
    </View>
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
  },
  smallVersion: {
    fontSize: 12,
    color: colors.primary600
  }
});

export default VersionFooter;