import React, { FC } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@react-navigation/native";
import CustomText from "../CustomText";
import { Ionicons } from "@expo/vector-icons";
import { MARGIN_VERTICAL } from "../../src/constants";

interface StatisticItemProps {
  label: string,
  description: string,
  icon: string,
  style?: any,
}

const StatisticItem: FC<StatisticItemProps> = ({ label, description, icon, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <LinearGradient
      colors={[colors.cardAccent600, colors.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.root, style]}
    >
      <View style={styles.header}>
        <Ionicons name={icon} size={10} color={colors.primary300} />
        <CustomText weight={"SemiBold"} style={styles.description}>
          {description}
        </CustomText>
      </View>
      <CustomText weight={"Black"} style={styles.title}>{label}</CustomText>
    </LinearGradient>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    backgroundColor: colors.cardAccent600,
    paddingBottom: 5,
  },
  title: {
    color: colors.primary300,
    paddingVertical: MARGIN_VERTICAL,
    textAlign: 'center',
    fontSize: 28,
  },
  header: {
    backgroundColor: colors.cardAccent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  description: {
    color: colors.primary300,
    fontSize: 12,
  }
});

export default StatisticItem;