import React, { FC } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "./CustomText";
import { Ionicons } from "@expo/vector-icons";
import { MARGIN_HORIZONTAL } from "../src/constants";

interface CardProps {
  wordIndex: number;
  currentIndex: number;
  text: string;
  onBackPress: () => void;
  onEditPress: () => void;
}

const Card: FC<CardProps> = ({ wordIndex, currentIndex, text, onBackPress, onEditPress }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.root}>
      <View style={{ flex: 1.5 }}/>
      <CustomText weight={"SemiBold"} style={styles.text}>
        {wordIndex === currentIndex ? text : ``}
      </CustomText>
      <View style={{ flex: 1 }}/>
      <View style={styles.cardIconsContainer}>
        <Ionicons
          name={'arrow-back-outline'}
          size={24}
          color={colors.primary600}
          style={[styles.icon, { opacity: wordIndex != 0 ? 1 : 0.4}]}
          onPress={() => wordIndex != 0 && onBackPress()}
        />
        <View style={{ flex: 1 }}/>
        <Ionicons
          name={'pencil-outline'}
          size={24}
          style={styles.icon}
          color={colors.primary600}
          onPress={onEditPress}
        />
      </View>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.card,
  },
  text: {
    color: colors.primary,
    fontSize: 24,
    textAlign: 'center',
    paddingHorizontal: MARGIN_HORIZONTAL * 2
  },
  cardIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    padding: MARGIN_HORIZONTAL
  }
});

export default Card;