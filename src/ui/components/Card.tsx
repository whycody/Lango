import React, { FC, memo } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "./CustomText";
import { Ionicons } from "@expo/vector-icons";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import { LinearGradient } from "expo-linear-gradient";

interface CardProps {
  text: string;
  wordIndex: number;
  onBackPress: () => void;
  onEditPress: () => void;
}

const Card: FC<CardProps> = ({ wordIndex, text, onBackPress, onEditPress }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <LinearGradient
      colors={[colors.cardAccent, colors.cardAccent600]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.root}
    >
      <CustomText weight={"SemiBold"} style={styles.text} adjustsFontSizeToFit>
        {text}
      </CustomText>
      <View style={styles.cardIconsContainer}>
        <Ionicons
          name={'arrow-back-outline'}
          size={24}
          color={colors.primary300}
          style={[styles.icon, { opacity: wordIndex != 0 ? 1 : 0.4 }]}
          onPress={() => wordIndex != 0 && onBackPress()}
        />
        <View style={{ flex: 1 }}/>
        <Ionicons
          name={'pencil-outline'}
          size={24}
          style={styles.icon}
          color={colors.primary300}
          onPress={onEditPress}
        />
      </View>
    </LinearGradient>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cardAccent300,
  },
  text: {
    color: colors.primary,
    fontSize: 24,
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginHorizontal: MARGIN_HORIZONTAL * 2,
    marginTop: MARGIN_VERTICAL * 2,
  },
  cardIconsContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    padding: MARGIN_HORIZONTAL
  }
});

export default memo(Card);