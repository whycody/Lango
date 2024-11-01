import React, { FC } from "react";
import { Pressable, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "./CustomText";
import { Ionicons } from "@expo/vector-icons";

interface ActionButtonProps {
  label: string,
  primary?: boolean,
  icon?: string,
  onPress?: () => void,
  style?: any,
}

const ActionButton: FC<ActionButtonProps> = ({ label, primary, icon, onPress, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors, primary);

  return (
    <Pressable style={[styles.root, style]} android_ripple={{ color: primary ? 'white' : colors.card }} onPress={onPress}>
      <CustomText weight={"Bold"} style={styles.label}>{label}</CustomText>
      {icon &&
        <Ionicons name={icon} color={primary ? colors.card : colors.primary} size={14} style={styles.icon}/>
      }
    </Pressable>
  );
}

const getStyles = (colors: any, primary: boolean) => StyleSheet.create({
  root: {
    backgroundColor: primary ? colors.primary : undefined,
    borderWidth: primary ? 0 : 2,
    borderColor: colors.cardAccent,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: primary ? colors.card : colors.primary,
    fontSize: 13,
  },
  icon: {
    marginTop: 2,
    marginLeft: 4,
  }
});

export default ActionButton;