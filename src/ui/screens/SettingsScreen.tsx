import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import CustomText from "../components/CustomText";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";

const SettingsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <>
      <View style={[styles.statusBar, { height: insets.top }]}/>
      <ScrollView style={styles.root}>
        <CustomText weight="Bold" style={styles.title}>{t('settings')}</CustomText>
        <CustomText style={styles.subtitle}>{t('settings_long_desc')}</CustomText>
      </ScrollView>
    </>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.card,
  },
  statusBar: {
    backgroundColor: colors.card
  },
  title: {
    marginTop: MARGIN_VERTICAL,
    marginHorizontal: MARGIN_HORIZONTAL,
    color: colors.primary,
    fontSize: 24,
  },
  subtitle: {
    color: colors.primary600,
    marginHorizontal: MARGIN_HORIZONTAL,
    marginTop: MARGIN_VERTICAL / 3,
    fontSize: 15
  },
});

export default SettingsScreen;