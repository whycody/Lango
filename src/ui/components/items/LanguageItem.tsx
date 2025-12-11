import { FC, memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL } from "../../../constants/margins";
import CustomText from "../CustomText";
import { useTheme } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import SquareFlag from "../SquareFlag";
import { Language } from "../../../types";

type LanguageItemProps = {
  index: number;
  language: Language,
  checked: boolean,
  onPress: () => void;
  style?: any;
}

const LanguageItem: FC<LanguageItemProps> =
  ({ index, language, checked, onPress, style }) => {
    const { colors } = useTheme();
    const styles = getStyles(colors);

    return (
      <Pressable
        key={language.languageCode}
        style={[styles.root, style]}
        onPress={onPress}
        android_ripple={{ color: colors.background }}
      >
        {index !== 0 && <View style={{ width: '100%', height: 3, backgroundColor: colors.background }}/>}
        <View style={[styles.container, checked && { backgroundColor: colors.background }]}>
          <Ionicons name={'language-sharp'} color={colors.primary600} size={22}/>
          <View style={styles.textContainer}>
            <CustomText weight={'SemiBold'} style={styles.text}>{language.languageName}</CustomText>
            <CustomText style={styles.translation}>{language.languageInTargetLanguage}</CustomText>
          </View>
          <SquareFlag languageCode={language.languageCode}/>
        </View>
      </Pressable>
    );
  }

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    backgroundColor: colors.card,
  },
  container: {
    paddingVertical: 15,
    paddingHorizontal: MARGIN_HORIZONTAL,
    flexDirection: 'row',
    alignItems: 'center'
  },
  textContainer: {
    flex: 1,
    marginLeft: 10
  },
  text: {
    color: colors.primary,
    fontSize: 14
  },
  translation: {
    color: colors.primary300,
    fontSize: 13
  },
  icon: {
    marginLeft: 10,
    padding: 5,
    paddingRight: 0,
  }
})

export default memo(LanguageItem);