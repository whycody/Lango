import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import CustomText from "./CustomText";
import { FC } from "react";

interface HeaderProps {
  title: string;
  subtitle?: string;
  style?: any;
}

const Header: FC<HeaderProps> = ({ title, subtitle, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={style}>
      <CustomText style={styles.title} weight={"SemiBold"}>{title}</CustomText>
      {subtitle &&
        <CustomText style={styles.subtitle}>{subtitle}</CustomText>
      }
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  title: {
    color: colors.primary300,
    fontSize: 18,
  },
  subtitle: {
    color: colors.primary600,
    fontSize: 14,
    marginTop: 2,
  }
});

export default Header;