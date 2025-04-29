import { View, StyleSheet, BackHandler } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import Header from "../../components/Header";
import Flashcard from "../../components/Flashcard";
import ActionButton from "../../components/ActionButton";
import { useEffect, useRef, useState } from "react";
import { FlashcardContent, useFlashcards } from "../../store/FlashcardsContext";

const WordsSuggestionsCard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);

  const flashcardsContext = useFlashcards();
  const [firstFlashcard, setFirstFlashcard] = useState<FlashcardContent>();
  const [secondFlashcard, setSecondFlashcard] = useState<FlashcardContent>();
  const firstFlashcardRef = useRef<{ flipWithoutAdd: () => void }>(null);
  const secondFlashcardRef = useRef<{ flipWithoutAdd: () => void }>(null);

  useEffect(() => {
    if (!flashcardsContext.flashcards) return;
    setFirstFlashcard(flashcardsContext.getRandomFlashcard);
    setSecondFlashcard(flashcardsContext.getRandomFlashcard);
  }, [flashcardsContext.flashcards]);

  const flipFlashcards = () => {
    firstFlashcardRef.current?.flipWithoutAdd();
    secondFlashcardRef.current?.flipWithoutAdd();
  }

  return (
    <View style={styles.root}>
      <Header title={t('wordsSuggestion')} subtitle={t('wordSuggestionDesc')}/>
      <View style={styles.flashcardsContainer}>
        <Flashcard
          ref={firstFlashcardRef}
          onFlashcardPress={() => setFirstFlashcard(flashcardsContext.getRandomFlashcard())}
          flashcardContent={firstFlashcard}
          style={{ flex: 1, marginRight: MARGIN_HORIZONTAL / 2 }}
        />
        <Flashcard
          ref={secondFlashcardRef}
          onFlashcardPress={() => setSecondFlashcard(flashcardsContext.getRandomFlashcard())}
          flashcardContent={secondFlashcard}
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