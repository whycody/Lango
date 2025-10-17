import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import Header from "../../components/Header";
import Flashcard from "../../components/Flashcard";
import ActionButton from "../../components/ActionButton";
import { useEffect, useRef, useState } from "react";
import { useDebouncedSyncSuggestions, useSuggestions } from "../../store/SuggestionsContext";
import { Suggestion } from "../../store/types";
import { useLanguage } from "../../store/LanguageContext";

const WordsSuggestionsCard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const suggestionsContext = useSuggestions();
  const { mainLang } = useLanguage();
  const [firstFlashcard, setFirstFlashcard] = useState<Suggestion>();
  const [secondFlashcard, setSecondFlashcard] = useState<Suggestion>();
  const firstFlashcardRef = useRef<{ flipWithoutAdd: () => void }>(null);
  const secondFlashcardRef = useRef<{ flipWithoutAdd: () => void }>(null);

  useEffect(() => {
    if (suggestionsContext.suggestions.length == 0 ||
      (firstFlashcard && firstFlashcard.mainLang == mainLang &&
        secondFlashcard && secondFlashcard.mainLang == mainLang)
    ) return;
    const sortedSuggestions = suggestionsContext.langSuggestions.slice().sort((a, b) => a.displayCount - b.displayCount);
    const [firstSuggestion, secondSuggestion] = sortedSuggestions.slice(0, 2);

    setFirstFlashcard(firstSuggestion);
    setSecondFlashcard(secondSuggestion);

    if (!firstSuggestion && !secondSuggestion) return;

    suggestionsContext.increaseSuggestionsDisplayCount([firstSuggestion, secondSuggestion].filter(Boolean).map(s => s.id));
  }, [suggestionsContext.langSuggestions, firstFlashcard, secondFlashcard]);

  const debouncedSyncSuggestions = useDebouncedSyncSuggestions(suggestionsContext.syncSuggestions, 3000);

  const flipFlashcards = () => {
    if (firstFlashcard) firstFlashcardRef.current?.flipWithoutAdd();
    if (secondFlashcard) secondFlashcardRef.current?.flipWithoutAdd();
    debouncedSyncSuggestions();
  }

  const handleFlashcardPress = async (first: boolean, add: boolean) => {
    await suggestionsContext.skipSuggestions(first ? [firstFlashcard?.id] : [secondFlashcard?.id], add ? 'added' : 'skipped');
    const currentFlashcards = [firstFlashcard, secondFlashcard].filter(Boolean);
    const filteredSuggestions = suggestionsContext.langSuggestions.filter((suggestion) =>
      !currentFlashcards.map((flashcard) => flashcard.id).includes(suggestion.id))
    const newSuggestion = filteredSuggestions.length > 0 ? filteredSuggestions[first ? 0 : 1] : null;
    if (newSuggestion) await suggestionsContext.increaseSuggestionsDisplayCount([newSuggestion?.id])
    first ? setFirstFlashcard(newSuggestion) : setSecondFlashcard(newSuggestion);
    debouncedSyncSuggestions();
  }

  return (
    <View style={styles.root}>
      <Header title={t('wordsSuggestion')} subtitle={t('wordSuggestionDesc')}/>
      <View style={styles.flashcardsContainer}>
        <Flashcard
          ref={firstFlashcardRef}
          onFlashcardPress={(add: boolean) => handleFlashcardPress(true, add)}
          suggestion={firstFlashcard}
          style={{ flex: 1, marginRight: MARGIN_HORIZONTAL / 2 }}
        />
        <Flashcard
          ref={secondFlashcardRef}
          onFlashcardPress={(add: boolean) => handleFlashcardPress(false, add)}
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