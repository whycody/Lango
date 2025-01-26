import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import CustomText from "../components/CustomText";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import { firstLanguage, secondLanguage } from "../components/Flashcard";
import { USER, useWords, Word } from "../store/WordsContext";
import WordInput from "../components/WordInput";

interface HandleFlashcardBottomSheetProps {
  flashcardId?: string;
  onWordEdit?: (id: string, word: string, translation: string) => void;
}

const HandleFlashcardBottomSheet = forwardRef<BottomSheetModal, HandleFlashcardBottomSheetProps>((props, ref) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const wordsContext = useWords();

  const wordInputRef = useRef<any>(null);
  const translationInputRef = useRef<any>(null);

  const flashcard: Word | null = props.flashcardId ? wordsContext.getWord(props.flashcardId) : null;
  const [word, setWord] = useState(flashcard?.text);
  const [translation, setTranslation] = useState(flashcard?.translation);

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const clearInputs = () => {
    setWord('');
    setTranslation('');
    wordInputRef.current?.clearWord();
    translationInputRef.current?.clearWord();
  }

  useEffect(() => {
    if (!props.flashcardId) {
      clearInputs()
    } else {
      const flashcard: Word = wordsContext.getWord(props.flashcardId);
      setWord(flashcard.text);
      setTranslation(flashcard.translation);
    }
  }, [props.flashcardId]);

  const editFlashcard = () => {
    const word = wordInputRef.current?.getWord();
    const translation = translationInputRef.current?.getWord();
    wordsContext.editWord(props.flashcardId, word, translation);
    props.onWordEdit?.(props.flashcardId, word, translation);
    ref.current?.dismiss();
  }

  const addFlashcard = (multiple: boolean) => {
    const word = wordInputRef.current?.getWord();
    const translation = translationInputRef.current?.getWord();
    wordsContext.addWord(word, translation, USER);
    if (!multiple) {
      ref.current?.dismiss();
    } else {
      clearInputs();
      wordInputRef.current?.focus();
    }
  }

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
      onDismiss={!props.flashcardId && clearInputs}
    >
      <BottomSheetView style={styles.root}>
        <CustomText weight={"Bold"} style={styles.title}>
          {props.flashcardId ? t('editFlashcard') : t('addNewFlashcard')}
        </CustomText>
        <CustomText style={styles.subtitle}>{t('wordAndTranslation')}</CustomText>
        <WordInput
          ref={wordInputRef}
          word={word}
          onWordChange={setWord}
          languageCode={firstLanguage}
          style={{ marginTop: 15 }}
        />
        <WordInput
          ref={translationInputRef}
          word={translation}
          onWordChange={setTranslation}
          languageCode={secondLanguage}
          style={{ marginTop: 15 }}
        />
        <ActionButton
          onPress={() => props.flashcardId ? editFlashcard() : addFlashcard(false)}
          label={props.flashcardId ? t('edit') : t('add')}
          primary={true}
          style={styles.button}
          icon={'save-sharp'}
        />
        {props.flashcardId ? <View style={{ height: MARGIN_VERTICAL }}/> :
          <CustomText
            style={styles.actionText}
            weight={'SemiBold'}
            onPress={() => addFlashcard(true)}
          >
            {t('addAnother')}
          </CustomText>}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingHorizontal: MARGIN_HORIZONTAL,
  },
  header: {
    paddingTop: MARGIN_VERTICAL,
  },
  title: {
    color: colors.primary300,
    fontSize: 18,
    marginTop: 12,
  },
  subtitle: {
    color: colors.primary600,
    fontSize: 14,
    marginBottom: 8,
    marginTop: 4,
  },
  sessionItemsContainer: {
    flexDirection: 'row',
    flex: 1,
    marginTop: 12,
  },
  button: {
    marginTop: MARGIN_VERTICAL
  },
  actionText: {
    color: colors.primary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: MARGIN_VERTICAL
  },
});

export default HandleFlashcardBottomSheet;