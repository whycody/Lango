import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../../../constants/margins";
import { CustomText, SquareFlag } from "../";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Language } from "../../../types";
import { LinearGradient } from "expo-linear-gradient";

type LanguageItemProps = {
  index: number;
  language: Language;
  checked: boolean;
  showIcon?: boolean;
  onPress?: () => void;
  style?: any;
};

export const LanguageItem = memo<LanguageItemProps>(
  ({ index, language, checked, showIcon = true, onPress, style }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
      <Pressable
        key={language.languageCode}
        style={style}
        onPress={onPress}
        android_ripple={onPress && { color: colors.background }}
      >
        {index !== 0 && <View style={styles.divider} />}
        <LinearGradient
          colors={[
            "transparent",
            checked ? colors.cardAccent600 : "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.container}>
            {showIcon && (
              <Ionicons
                name={"language-sharp"}
                color={colors.primary600}
                size={22}
              />
            )}
            <View style={styles.textContainer}>
              <CustomText weight={"SemiBold"} style={styles.text}>
                {language.languageName}
              </CustomText>
              <CustomText style={styles.translation}>
                {language.languageInTargetLanguage}
              </CustomText>
            </View>
            <SquareFlag languageCode={language.languageCode} />
          </View>
        </LinearGradient>
      </Pressable>
    );
  },
);

LanguageItem.displayName = "LanguageItem";

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      gap: 10,
      paddingVertical: 15,
      paddingHorizontal: MARGIN_HORIZONTAL,
      flexDirection: "row",
      alignItems: "center",
    },
    textContainer: {
      flex: 1,
    },
    text: {
      color: colors.primary,
      fontSize: 14,
    },
    translation: {
      color: colors.primary300,
      fontSize: 13,
    },
    icon: {
      marginLeft: 10,
      padding: 5,
      paddingRight: 0,
    },
    divider: {
      width: "100%",
      height: 3,
      backgroundColor: colors.background,
    },
  });
