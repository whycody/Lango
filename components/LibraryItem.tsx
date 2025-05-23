import { FC } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../src/constants";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import CustomText from "./CustomText";

interface LibraryItemProps {
  index: number,
  label: string,
  description?: string,
  onPress?: () => void,
  icon?: string,
}

const LibraryItem: FC<LibraryItemProps> = ({ index, label, description, onPress, icon }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors, index);

  return (
    <Pressable
      style={({ pressed }) => [styles.root, pressed && Platform.OS === 'ios' && { opacity: 0.8 }]}
      android_ripple={{ color: index % 2 === 0 ? colors.card : colors.background }}
      onPress={onPress}
    >
      {icon &&
        <Ionicons name={icon} color={colors.primary300} size={24} style={styles.icon}/>
      }
      <View>
        <CustomText weight={"SemiBold"} style={styles.label}>{label}</CustomText>
        {description && <CustomText weight={"Regular"} style={styles.description}>{description}</CustomText>}
      </View>
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
  description: {
    color: colors.primary600,
    fontSize: 12,
  }
});

export default LibraryItem;