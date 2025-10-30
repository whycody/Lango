import { FC } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomText from "../CustomText";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { FLASHCARD_SIDE } from "../../store/UserPreferencesContext";
import { SESSION_MODE } from "../../store/types";

interface SessionSpeechSynthesizerItemProps {
  synthesizerOn: boolean,
  selected: boolean;
  onPress?: () => void,
  style?: any;
}

const SessionSpeechSynthesizerItem: FC<SessionSpeechSynthesizerItemProps> = ({ synthesizerOn, selected, onPress, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors, selected);
  const { t } = useTranslation();

  const iconName = synthesizerOn ? 'volume-high-outline' : 'volume-mute-outline';

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
          {t(synthesizerOn ? 'turned_on' : 'turned_off')}
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

export default SessionSpeechSynthesizerItem;