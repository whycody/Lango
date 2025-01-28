import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "./CustomText";
import React from "react";

type AlertProps = {
  type: 'error' | 'success';
  title: string;
  message: string;
  style?: any;
}

const Alert = ({ type, title, message, style }: AlertProps) => {
  const { colors } = useTheme();
  const styles = getStyles(colors, type);

  return (
    <View style={[styles.root, style]}>
      <View style={styles.headerContainer}>
        <Ionicons name={type == 'success' ? 'checkmark-circle' : 'close-circle'} color={colors.background} size={21}/>
        <CustomText weight={'Bold'} style={styles.header}>{title}</CustomText>
      </View>
      <CustomText weight={'SemiBold'} style={styles.message}>{message}</CustomText>
    </View>
  );
}

const getStyles = (colors: any, type: 'error' | 'success') => StyleSheet.create({
  root: {
    backgroundColor: type == 'success' ? '#73c576' : '#e48181',
    paddingVertical: 12,
    paddingHorizontal: MARGIN_HORIZONTAL / 2,
    marginVertical: 5
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  header: {
    color: colors.background,
    marginLeft: 5
  },
  message: {
    color: colors.card,
    fontSize: 13,
    marginLeft: 2,
    marginTop: 3
  }
});

export default Alert;