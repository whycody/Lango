import * as React from "react";
import { FC } from "react";
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MARGIN_HORIZONTAL } from "../../../constants/margins";

type EmptyListProps = {
  title?: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const EmptyList: FC<EmptyListProps> = ({
  title,
  description,
  icon,
  onPress,
  style,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <Pressable style={[styles.emptyViewContainer, style]} onPress={onPress}>
      <Ionicons
        name={icon ? icon : "file-tray-sharp"}
        size={35}
        color={colors.primary300}
        style={styles.icon}
      />
      <Text style={styles.header}>{title}</Text>
      <Text style={styles.text}>{description}</Text>
    </Pressable>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    icon: {
      marginBottom: 10,
      opacity: 0.8,
    },
    emptyViewContainer: {
      alignItems: "center",
      justifyContent: "center",
      marginVertical: 50,
    },
    header: {
      color: colors.primary300,
      fontWeight: "bold",
      textAlign: "center",
      fontSize: 18,
    },
    text: {
      color: colors.primary300,
      textAlign: "center",
      opacity: 0.8,
      fontSize: 14,
      marginHorizontal: MARGIN_HORIZONTAL * 3,
    },
  });
