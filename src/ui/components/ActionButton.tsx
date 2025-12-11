import React, { FC, useRef } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Animated, Easing } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "./CustomText";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useHaptics } from "../../hooks/useHaptics";

interface ActionButtonProps {
  label: string,
  active?: boolean,
  primary?: boolean,
  icon?: string,
  onPress?: () => void,
  style?: any,
  loading?: boolean,
}

const ActionButton: FC<ActionButtonProps> = ({ label, active = true, primary, icon, onPress, style, loading = false }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors, primary, active);
  const { triggerHaptics } = useHaptics();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    triggerHaptics(Haptics.ImpactFeedbackStyle.Rigid);
    onPress?.();
  }

  const handlePressIn = () => {
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.7,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}
    >
      <Pressable
        style={[styles.root, style]}
        android_ripple={{ color: primary ? 'white' : colors.card }}
        onPress={active && !loading ? handlePress : undefined}
        onPressIn={active && !loading ? handlePressIn : undefined}
        onPressOut={active && !loading ? handlePressOut : undefined}
      >
        {loading ? (
          <ActivityIndicator size="small" color={primary ? colors.card : colors.primary}/>
        ) : (
          <>
            <CustomText weight={"Bold"} style={styles.label}>{label}</CustomText>
            {icon &&
              <Ionicons name={icon} color={primary ? colors.card : colors.primary} size={14} style={styles.icon}/>}
          </>
        )}
      </Pressable>
    </Animated.View>
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