import { ScrollView, StyleSheet, View } from "react-native";
import CustomText from "../components/CustomText";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import StatisticItem from "../components/StatisticItem";
import { LANGO, useWords } from "../store/WordsContext";
import { useTranslation } from "react-i18next";
import ActionButton from "../components/ActionButton";

const FlashcardsScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const wordsContext = useWords();
  const numberOfWords = wordsContext.words.length;
  const langoWords = wordsContext.words.filter((word) => word.source == LANGO).length;

  return (
    <View style={styles.root}>
      <ScrollView>
        <CustomText weight={"Bold"} style={styles.title}>{t('flashcards')}</CustomText>
        <CustomText style={styles.subtitle}>
          {t('soFar', { wordsCount: numberOfWords }) + ' ' + (langoWords > 0 ? t('brag', { langoWords: langoWords }) : t('nextTime'))}
        </CustomText>
        <View style={styles.statsContainer}>
          <StatisticItem label={`${numberOfWords}`} description={t('words')} style={{ flex: 1, marginRight: 6 }}/>
          <StatisticItem label={`${langoWords}`} description={t('langoWords')} style={{ flex: 1, marginLeft: 6 }}/>
        </View>
      </ScrollView>
      <ActionButton label={t('addWord')} primary={true} style={styles.button} />
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    flex: 1,
  },
  title: {
    marginTop: MARGIN_VERTICAL,
    marginHorizontal: MARGIN_HORIZONTAL,
    color: colors.primary,
    fontSize: 26,
  },
  subtitle: {
    color: colors.primary600,
    marginHorizontal: MARGIN_HORIZONTAL,
    marginTop: MARGIN_VERTICAL / 3,
    fontSize: 15
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: MARGIN_HORIZONTAL,
    marginTop: 15
  },
  button: {
    marginHorizontal: MARGIN_HORIZONTAL,
    marginVertical: MARGIN_VERTICAL / 2
  }
});

export default FlashcardsScreen;