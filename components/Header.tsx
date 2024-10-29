import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { expo } from '.././app.json'
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import CustomText from "./CustomText";

const Header = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.root}>
      <CustomText weight={"Bold"} style={styles.mainText}>{expo.name}</CustomText>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    backgroundColor: colors.card,
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: MARGIN_VERTICAL,
  },
  mainText: {
    color: colors.primary,
    fontSize: 26,
  },
});

export default Header;