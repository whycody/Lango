import { Image, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
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
  const version = appBuildNumbers.expo.version;

  return (
    <View>
      {!small &&
        <Image
          source={require('../../../assets/logo.png')}
          style={styles.image}
          resizeMode="contain"
        />
      }
      <CustomText style={[style, styles.version, small && styles.smallVersion]}>
        {`${version}`}
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
    color: colors.primary300,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 13
  },
  smallVersion: {
    fontSize: 12,
    color: colors.primary600
  }
});

export default VersionFooter;