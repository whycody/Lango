import { FC } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomText from "../CustomText";
import { Ionicons } from "@expo/vector-icons";
import { SESSION_MODE } from "../../sheets/StartSessionBottomSheet";

interface SessionModeItemProps {
  mode: SESSION_MODE,
  selected: boolean;
  onPress?: () => void,
  style?: any;
}

const SessionModeItem: FC<SessionModeItemProps> = ({ mode, selected, onPress, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors, selected);
  const { t } = useTranslation();

  return (
    <Pressable
      style={[styles.root, style]}
      android_ripple={{ color: colors.card }}
      onPress={onPress}
    >
      <Ionicons
        name={mode == SESSION_MODE.STUDY ? 'school-outline' : mode == SESSION_MODE.RANDOM ? 'dice-outline' : 'time-outline'}
        color={colors.primary300}
        size={18}
        style={styles.icon}
      />
      <CustomText weight={"Bold"} style={styles.title}>
        {t(mode.toLowerCase())}
      </CustomText>
    </Pressable>
  );
}

const getStyles = (colors: any, selected: boolean) => StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    opacity: selected ? 1 : 0.5,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  icon: {
    paddingRight: 5,
  },
  squaresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    color: colors.primary300
  },
});

export default SessionModeItem;