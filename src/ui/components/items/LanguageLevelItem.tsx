import React, { FC } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import CustomText from "../CustomText";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL } from "../../../constants/margins";
import { LanguageLevelRange } from "../../../types";
import { LinearGradient } from "expo-linear-gradient";

type LanguageLevelItemProps = {
  level: LanguageLevelRange;
  code: string;
  label: string;
  desc: string;
  picked: boolean;
  onPress: (level: LanguageLevelRange) => void;
};

export const LanguageLevelItem: FC<LanguageLevelItemProps> = ({
  level,
  code,
  label,
  desc,
  picked,
  onPress,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <>
      {level !== 1 && <View style={styles.divider} />}
      <LinearGradient
        colors={["transparent", picked ? colors.cardAccent300 : "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Pressable
          style={styles.root}
          onPress={() => onPress(level)}
          android_ripple={{ color: colors.background }}
        >
          <CustomText weight={"Black"} style={styles.code}>
            {code}
          </CustomText>
          <View style={styles.content}>
            <CustomText style={styles.title} weight={"Bold"}>
              {label}
            </CustomText>
            <CustomText style={styles.desc} weight={"Regular"}>
              {desc}
            </CustomText>
          </View>
        </Pressable>
      </LinearGradient>
    </>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    root: {
      padding: MARGIN_HORIZONTAL,
      flexDirection: "row",
      alignItems: "center",
    },
    code: {
      width: 45,
      color: colors.primary600,
      fontSize: 18,
      paddingRight: MARGIN_HORIZONTAL,
    },
    title: {
      fontSize: 13,
      color: colors.primary,
    },
    desc: {
      fontSize: 12,
      color: colors.primary300,
    },
    divider: {
      width: "100%",
      height: 3,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
  });
