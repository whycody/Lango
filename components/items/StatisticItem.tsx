import React, { FC } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "../CustomText";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import { Ionicons } from "@expo/vector-icons";

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
    <View style={[styles.root, style]}>
      <View style={styles.header}>
        <Ionicons name={icon} size={10} color={colors.primary300} />
        <CustomText weight={"SemiBold"} style={styles.description}>
          {description}
        </CustomText>
      </View>
      <CustomText weight={"Black"} style={styles.title}>{label}</CustomText>
    </View>
  );
}

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
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  description: {
    color: colors.primary300,
    fontSize: 10,
  }
});

export default StatisticItem;