import React, { FC } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "./CustomText";
import { Ionicons } from "@expo/vector-icons";

interface MainActionButtonProps {
  label: string,
  icon?: string,
  onPress?: () => void,
  style?: any,
}

const MainActionButton: FC<MainActionButtonProps> = ({ label, icon, onPress, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Pressable style={[styles.root, style]} android_ripple={{ color: 'white' }} onPress={onPress}>
      <CustomText weight={"Bold"} style={styles.label}>{label}</CustomText>
      {icon &&
        <Ionicons name={icon} color={colors.card} size={14} style={styles.icon}/>
      }
    </Pressable>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: colors.card,
    fontSize: 13,
  },
  icon: {
    marginTop: 2,
    marginLeft: 4,
  }
});

export default MainActionButton;