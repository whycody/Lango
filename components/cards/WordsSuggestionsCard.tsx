import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import Header from "../Header";
import Flashcard from "../Flashcard";
import ActionButton from "../ActionButton";

const WordsSuggestionsCard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  return (
    <View style={styles.root}>
      <Header title={t('wordsSuggestion')} subtitle={t('wordSuggestionDesc')} />
      <View style={styles.flashcardsContainer}>
        <Flashcard word={'el camión'} translation={'ciężarówka'} style={{ flex: 1, marginRight: MARGIN_HORIZONTAL/2 }}/>
        <Flashcard word={'la cafetera italiana'} translation={'kawiarka'} style={{ flex: 1, marginLeft: MARGIN_HORIZONTAL/2 }}/>
      </View>
      <ActionButton label={t('addWord')} style={styles.actionButton}/>
    </View>
  );
}

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    backgroundColor: colors.card,
    paddingVertical: MARGIN_VERTICAL,
    paddingHorizontal: MARGIN_HORIZONTAL
  },
  flashcardsContainer: {
    marginTop: 14,
    flexDirection: 'row',
  },
  actionButton: {
    marginTop: 16,
  }
});

export default WordsSuggestionsCard;