import { FC } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomText from "../CustomText";
import { Ionicons } from "@expo/vector-icons";
import { FLASHCARD_SIDE, SESSION_MODE } from "../../sheets/StartSessionBottomSheet";
import { LinearGradient } from "expo-linear-gradient";

interface SessionModeItemProps {
  mode: SESSION_MODE | FLASHCARD_SIDE,
  selected: boolean;
  onPress?: () => void,
  style?: any;
}

const SessionModeItem: FC<SessionModeItemProps> = ({ mode, selected, onPress, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors, selected);
  const { t } = useTranslation();

  let iconName = '';
  switch (mode) {
    case SESSION_MODE.STUDY:
      iconName = 'school-outline';
      break;
    case SESSION_MODE.RANDOM:
      iconName = 'dice-outline';
      break;
    case SESSION_MODE.OLDEST:
      iconName = 'time-outline';
      break;
    case FLASHCARD_SIDE.WORD:
      iconName = 'chatbubbles-outline';
      break;
    case FLASHCARD_SIDE.TRANSLATION:
      iconName = 'language-outline';
      break;
  }

  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={onPress}
    >
      <LinearGradient
        colors={[colors.cardAccent600, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.root, style]}
      >
        <Ionicons
          name={iconName}
          color={colors.primary300}
          size={18}
          style={styles.icon}
        />
        <CustomText weight={"Bold"} style={styles.title}>
          {t(mode.toLowerCase())}
        </CustomText>
      </LinearGradient>
    </Pressable>
  );
}

const getStyles = (colors: any, selected: boolean) => StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: selected ? 1 : 0.4,
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