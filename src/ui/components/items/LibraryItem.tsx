import { FC, memo } from "react";
import { Platform, Pressable, StyleSheet, Switch, View, ViewStyle } from "react-native";
import { MARGIN_HORIZONTAL } from "../../../constants/margins";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "../CustomText";
import * as Haptics from 'expo-haptics';
import { useHaptics } from "../../../hooks/useHaptics";

interface LibraryItemProps {
  index: number,
  label: string,
  description?: string,
  onPress?: () => void,
  icon?: string,
  enabled?: boolean,
  style?: ViewStyle
}

const LibraryItem: FC<LibraryItemProps> = ({ index, label, description, onPress, icon, enabled, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors, index);
  const { triggerHaptics } = useHaptics();

  const handlePress = () => {
    onPress?.();
    triggerHaptics(Haptics.ImpactFeedbackStyle.Light);
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.root, pressed && Platform.OS === 'ios' && { opacity: 0.8 }, style]}
      android_ripple={{ color: index % 2 === 0 ? colors.card : colors.background }}
      onPress={handlePress}
    >
      {icon &&
        <Ionicons name={icon} color={colors.primary300} size={24} style={styles.icon}/>
      }
      <View style={styles.textContainer}>
        <CustomText weight={"SemiBold"} style={styles.label}>{label}</CustomText>
        {description && <CustomText weight={"Regular"} style={styles.description}>{description}</CustomText>}
      </View>
      {enabled !== undefined &&
        <Switch value={enabled} thumbColor={colors.primary} onValueChange={handlePress}/>
      }
    </Pressable>
  );
}

const getStyles = (colors: any, index: number) => StyleSheet.create({
  root: {
    backgroundColor: index % 2 === 0 ? colors.background : colors.card,
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    marginRight: 12,
  },
  label: {
    color: colors.primary300,
    fontSize: 14,
  },
  textContainer: {
    flex: 1,
  },
  description: {
    color: colors.primary600,
    fontSize: 12,
  }
});

export default memo(LibraryItem);