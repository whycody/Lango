import React, { FC } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "./CustomText";
import { MARGIN_VERTICAL } from "../src/constants";

interface StatisticItemProps {
  label: string,
  description: string,
  style?: any,
}

const StatisticItem: FC<StatisticItemProps> = ({ label, description, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={[styles.root, style]}>
      <CustomText weight={"Black"} style={styles.title}>{label}</CustomText>
      <CustomText weight={"SemiBold"} style={styles.description}>{description.toUpperCase()}</CustomText>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: MARGIN_VERTICAL,
  },
  title: {
    color: colors.primary300,
    fontSize: 28,
  },
  description: {
    color: colors.primary300,
    fontSize: 11,
    opacity: 0.6,
  }
});

export default StatisticItem;