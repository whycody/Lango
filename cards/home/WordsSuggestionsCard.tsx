import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import Header from "../../components/Header";
import Flashcard from "../../components/Flashcard";
import ActionButton from "../../components/ActionButton";
import { useEffect, useRef, useState } from "react";
import { Suggestion, useSuggestions } from "../../store/SuggestionsContext";

const WordsSuggestionsCard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const suggestionsContext = useSuggestions();
  const [firstFlashcard, setFirstFlashcard] = useState<Suggestion>();
  const [secondFlashcard, setSecondFlashcard] = useState<Suggestion>();
  const firstFlashcardRef = useRef<{ flipWithoutAdd: () => void }>(null);
  const secondFlashcardRef = useRef<{ flipWithoutAdd: () => void }>(null);

  useEffect(() => {
    if (suggestionsContext.suggestions.length == 0 || firstFlashcard || secondFlashcard) return;
    const sortedSuggestions = suggestionsContext.langSuggestions.slice().sort((a, b) => a.displayCount - b.displayCount);
    const [firstSuggestion, secondSuggestion] = sortedSuggestions.slice(0, 2);
    suggestionsContext.increaseSuggestionsDisplayCount([firstSuggestion.id, secondSuggestion.id]);
    setFirstFlashcard(firstSuggestion);
    setSecondFlashcard(secondSuggestion);
  }, [suggestionsContext.suggestions, firstFlashcard, secondFlashcard]);

  const flipFlashcards = () => {
    if (firstFlashcard) firstFlashcardRef.current?.flipWithoutAdd();
    if (secondFlashcard) secondFlashcardRef.current?.flipWithoutAdd();
  }

  const handleFlashcardPress = async (first: boolean) => {
    await suggestionsContext.skipSuggestions(first ? [firstFlashcard?.id] : [secondFlashcard?.id]);
    const newSuggestion = suggestionsContext.langSuggestions.filter((suggestion) =>
      ![firstFlashcard.id, secondFlashcard.id].includes(suggestion.id))[first ? 0 : 1];
    console.log(firstFlashcard.word, secondFlashcard.word)
    first ? setFirstFlashcard(newSuggestion) : setSecondFlashcard(newSuggestion);
  }

  return (
    <View style={styles.root}>
      <Header title={t('wordsSuggestion')} subtitle={t('wordSuggestionDesc')}/>
      <View style={styles.flashcardsContainer}>
        <Flashcard
          ref={firstFlashcardRef}
          onFlashcardPress={() => handleFlashcardPress(true)}
          suggestion={firstFlashcard}
          style={{ flex: 1, marginRight: MARGIN_HORIZONTAL / 2 }}
        />
        <Flashcard
          ref={secondFlashcardRef}
          onFlashcardPress={() => handleFlashcardPress(false)}
          suggestion={secondFlashcard}
          style={{ flex: 1, marginLeft: MARGIN_HORIZONTAL / 2 }}
        />
      </View>
      <ActionButton
        label={t('switch_suggestions')}
        style={styles.actionButton}
        onPress={flipFlashcards}
        icon={'sync'}
      />
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