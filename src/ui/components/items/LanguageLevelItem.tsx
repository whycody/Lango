import React, { FC } from "react";
import { StyleSheet, Pressable, View } from "react-native";
import CustomText from "../CustomText";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL } from "../../../constants/margins";
import { LanguageLevelRange } from "../../../types";

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
      <Pressable style={styles.root} onPress={() => onPress(level)} android_ripple={{ color: colors.background }}>
        <CustomText weight={'Black'} style={styles.code}>{code}</CustomText>
        <View style={{ flex: 1, }}>
          <CustomText style={[styles.text, styles.title]} weight={'Bold'}>{label}</CustomText>
          <CustomText style={[styles.text, styles.desc]} weight={'Regular'}>{desc}</CustomText>
        </View>
      </Pressable>
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
    color: colors.primary600,
    fontSize: 18,
    paddingRight: MARGIN_HORIZONTAL
  },
  text: {
    color: colors.text,
  },
  title: {
    fontSize: 13,
  },
  desc: {
    fontSize: 12,
    opacity: 0.5
  }
})

export default LanguageLevelItem;