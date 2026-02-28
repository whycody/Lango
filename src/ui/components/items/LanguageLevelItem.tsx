import React, { FC } from "react";
import { StyleSheet, Pressable, View } from "react-native";
import CustomText from "../CustomText";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL } from "../../../constants/margins";
import { LanguageLevelRange } from "../../../types";
import { LinearGradient } from "expo-linear-gradient";

type LanguageLevelItemProps = {
  level: LanguageLevelRange;
  code: string;
  label: string;
  desc: string;
  onPress: (level: LanguageLevelRange) => void;
}

const LanguageLevelItem: FC<LanguageLevelItemProps> = ({ level, code, label, desc, onPress }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <>{level !== 1 && <View style={{ width: '100%', height: 3, backgroundColor: colors.background }}/>}
      <LinearGradient
        colors={[colors.card, colors.background]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Pressable style={styles.root} onPress={() => onPress(level)} android_ripple={{ color: colors.background }}>
          <CustomText weight={'Black'} style={styles.code}>{code}</CustomText>
          <View style={{ flex: 1, }}>
            <CustomText style={[styles.text, styles.title]} weight={'Bold'}>{label}</CustomText>
            <CustomText style={[styles.text, styles.desc]} weight={'Regular'}>{desc}</CustomText>
          </View>
        </Pressable>
      </LinearGradient>
    </>
  )
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    padding: MARGIN_HORIZONTAL,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  code: {
    width: 45,
    color: colors.primary600,
    fontSize: 18,
    paddingRight: MARGIN_HORIZONTAL
  },
  text: {},
  title: {
    fontSize: 13,
    color: colors.primary
  },
  desc: {
    fontSize: 12,
    color: colors.primary300
  }
})

export default LanguageLevelItem;