import { FC } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomText from "../CustomText";
import { MARGIN_VERTICAL } from "../../src/constants";

interface SessionLengthItemProps {
  length: 1 | 2 | 3;
  selected: boolean;
  onPress?: () => void,
  style?: any;
}

const SessionLengthItem: FC<SessionLengthItemProps> = ({ length, selected, onPress, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors, selected);
  const { t } = useTranslation();

  return (
    <Pressable
      style={[styles.root, style]}
      android_ripple={{ color: colors.cardAccent }}
      onPress={onPress}
    >
      <View style={styles.squaresContainer}>
        {length > 2 &&
          <View style={styles.square}/>
        }
      </View>
      <View style={styles.squaresContainer}>
        {length > 1 &&
          <View style={styles.square}/>
        }
        <View style={styles.square}/>
      </View>
      <CustomText weight={"Bold"} style={styles.title}>
        {t(length === 1 ? 'shortSession' : length === 2 ? 'mediumSession' : 'longSession')}
      </CustomText>
      <CustomText style={styles.subtitle}>
        {(length * 10 + ` ${t('repetitions')}`).toUpperCase()}
      </CustomText>
    </Pressable>
  );
}

const getStyles = (colors: any, selected: boolean) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cardAccent300,
    opacity: selected ? 1 : 0.5,
    paddingTop: MARGIN_VERTICAL*1.2,
    paddingBottom: MARGIN_VERTICAL/2,
  },
  squaresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  square: {
    width: 20,
    height: 20,
    marginHorizontal: 2,
    marginTop: 4,
    backgroundColor: colors.primary300,
  },
  title: {
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
    color: colors.primary300
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: colors.primary300
  }
});

export default SessionLengthItem;