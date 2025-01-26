import { View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../src/constants";
import Header from "../../components/Header";
import Flashcard from "../../components/Flashcard";
import ActionButton from "../../components/ActionButton";
import { useWords } from "../../store/WordsContext";
import { useEffect, useRef, useState } from "react";
import { FlashcardContent, useFlashcards } from "../../store/FlashcardsContext";
import HandleFlashcardBottomSheet from "../../sheets/HandleFlashcardBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

const WordsSuggestionsCard = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const wordsContext = useWords();

  const flashcardsContext = useFlashcards();
  const flashcardBottomSheetRef = useRef<BottomSheetModal>(null);
  const [firstFlashcard, setFirstFlashcard] = useState<FlashcardContent>();
  const [secondFlashcard, setSecondFlashcard] = useState<FlashcardContent>();

  useEffect(() => {
    if(!flashcardsContext.flashcards) return;
    setFirstFlashcard(flashcardsContext.getRandomFlashcard);
    setSecondFlashcard(flashcardsContext.getRandomFlashcard);
  }, [flashcardsContext.flashcards]);

  return (
    <View style={styles.root}>
      <HandleFlashcardBottomSheet
        ref={flashcardBottomSheetRef}
      />
      <Header title={t('wordsSuggestion')} subtitle={t('wordSuggestionDesc')}/>
      <View style={styles.flashcardsContainer}>
        <Flashcard
          onFlashcardPress={() => setFirstFlashcard(flashcardsContext.getRandomFlashcard())}
          flashcardContent={firstFlashcard}
          style={{ flex: 1, marginRight: MARGIN_HORIZONTAL / 2 }}
        />
        <Flashcard
          onFlashcardPress={() => setSecondFlashcard(flashcardsContext.getRandomFlashcard())}
          flashcardContent={secondFlashcard}
          style={{ flex: 1, marginLeft: MARGIN_HORIZONTAL / 2 }}
        />
      </View>
      <ActionButton label={t('addWord')} style={styles.actionButton} onPress={() => flashcardBottomSheetRef.current?.present()}/>
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