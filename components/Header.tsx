import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { expo } from '.././app.json'
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";

const Header = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.root}>
      <Text style={styles.mainText}>{expo.name}</Text>
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
    fontWeight: 'bold'
  }
});

export default Header;