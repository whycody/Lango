import React, { FC } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "./CustomText";
import { Ionicons } from "@expo/vector-icons";

interface ActionButtonProps {
  label: string,
  active?: boolean,
  primary?: boolean,
  icon?: string,
  onPress?: () => void,
  style?: any,
}

const ActionButton: FC<ActionButtonProps> = ({ label, active = true, primary, icon, onPress, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors, primary, active);

  return (
    <Pressable
      style={({ pressed }) => [styles.root, style, pressed && Platform.OS === 'ios' && { opacity: 0.8 }]}
      android_ripple={{ color: primary ? 'white' : colors.card }}
      onPress={active ? onPress : undefined}
    >
      <CustomText weight={"Bold"} style={styles.label}>{label}</CustomText>
      {icon &&
        <Ionicons name={icon} color={primary ? colors.card : colors.primary} size={14} style={styles.icon}/>
      }
    </Pressable>
  );
}

const getStyles = (colors: any, primary: boolean, active: boolean) => StyleSheet.create({
  root: {
    opacity: active ? 1 : 0.5,
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