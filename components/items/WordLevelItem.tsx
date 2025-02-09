import { FC } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomText from "../CustomText";
import { MARGIN_HORIZONTAL } from "../../src/constants";

interface SessionLengthItemProps {
  level: 1 | 2 | 3;
  active: boolean;
  onPress?: () => void,
  style?: any;
}

const WordLevelItem: FC<SessionLengthItemProps> = ({ level, active, onPress, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  return (
    <Pressable
      style={({pressed}) => [getStyles(colors, pressed).root, style]}
      onPress={active ? onPress : undefined}
    >
      <View style={styles.rectanglesContainer}>
        <View style={[styles.rectangle, { opacity: level > 2 ? 1 : 0.3 }]}/>
        <View style={[styles.rectangle, { opacity: level > 1 ? 1 : 0.3 }]}/>
        <View style={[styles.rectangle, { opacity: 1 }]}/>
      </View>
      <CustomText weight={"Bold"} style={styles.title}>
        {t(level === 1 ? 'poorly' : level === 2 ? 'moderately' : 'good')}
      </CustomText>
    </Pressable>
  );
}

const getStyles = (colors: any, selected: boolean = false) => StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    opacity: selected ? 1 : 0.7,
    paddingTop: MARGIN_HORIZONTAL,
    paddingBottom: MARGIN_HORIZONTAL - 3,
  },
  rectanglesContainer: {
    alignItems: 'center'
  },
  rectangle: {
    width: 40,
    height: 13,
    marginTop: 2,
    backgroundColor: colors.primary300,
  },
  title: {
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
    color: colors.primary300
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: colors.primary300
  }
});

export default WordLevelItem;