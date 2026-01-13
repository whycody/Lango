import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import CustomText from "../components/CustomText";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import { useWords, WordSource } from "../../store/WordsContext";
import WordInput from "../components/WordInput";
import Alert from "../components/Alert";
import Header from "../components/Header";
import { FullWindowOverlay } from "react-native-screens";
import axios from "axios";
import TranslationUtils from "../../utils/translationUtils";
import { Word } from "../../types";
import { useLanguage } from "../../store/LanguageContext";

type WordTranslations = {
  word: string;
  translations: string[];
}

interface HandleFlashcardBottomSheetProps {
  flashcardId?: string;
  onWordEdit?: (id: string, word: string, translation: string) => void;
  onChangeIndex?: (index: number) => void;
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

  const [currentWord, setCurrentWord] = useState<string | null>('');
  const [wordTranslations, setWordTranslations] = useState<WordTranslations | null>(null);

  const [status, setStatus] = useState<'error' | 'success' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [buttonsActive, setButtonsActive] = useState(true);
  const { mainLang, translationLang } = useLanguage();

  const renderBackdrop = useCallback((props: any) =>
    <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />, [])

  const clearInputs = () => {
    setWord('');
    setTranslation('');
    wordInputRef.current?.clearWord();
    translationInputRef.current?.clearWord();
  }

  const clearStatus = () => {
    setStatus(null);
    setStatusMessage(null);
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

  const validateInputs = () => {
    const word = wordInputRef.current?.getWord().trim();
    const translation = translationInputRef.current?.getWord().trim();
    if (word && translation) return true;
    setStatus('error');
    setStatusMessage(t('bothInputs'));
    return false;
  }

  const editFlashcard = () => {
    if (!validateInputs()) return;
    scheduleDismiss();
    const word = wordInputRef.current?.getWord().trim();
    const translation = translationInputRef.current?.getWord().trim();
    wordsContext.editWord({ id: props.flashcardId, text: word, translation: translation });
    props.onWordEdit?.(props.flashcardId, word, translation);
    setStatusMessage(t('editWord', { word: word }));
  }

  const addFlashcard = (multiple: boolean) => {
    if (!validateInputs()) return;
    const word = wordInputRef.current?.getWord().trim();
    const translation = translationInputRef.current?.getWord().trim();
    wordsContext.addWord(word, translation, WordSource.USER);
    setStatusMessage(t('addNewWord', { word: word }));
    if (!multiple) {
      scheduleDismiss();
    } else {
      setWordTranslations(null);
      setTimeout(() => {
        clearInputs();
        setStatus('success');
        wordInputRef.current?.focus();
      }, 10);
    }
  }

  const scheduleDismiss = () => {
    setStatus('success');
    setTimeout(() => Keyboard.dismiss(), 950);
    setTimeout(() => ref.current?.dismiss(), 1000);
    setButtonsActive(false);
  }

  const handleSheetDismiss = () => {
    clearStatus();
    setButtonsActive(true);
    if (!props.flashcardId) clearInputs();
  }

  const abortControllerRef = useRef(new AbortController());

  const translateWord = async (text, from = mainLang, to = translationLang) => {
    abortControllerRef.current && abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      setWordTranslations(
        {
          word: text,
          translations: [(await TranslationUtils.translateText(text, from, to, abortControllerRef.current)).toLowerCase()]
        }
      );
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Błąd:", error?.response?.status, error?.response?.data || error?.message);
      }
    }
  };

  useEffect(() => {
    if (!word || word.trim().length === 0 || mainLang == translationLang) return;
    translateWord(word);
  }, [word, mainLang, translationLang]);

  const suggestions = wordTranslations && currentWord == wordTranslations.word ? wordTranslations.translations : [];

  const renderContainerComponent = Platform.OS === "ios" ? useCallback(({ children }: any) => (
    <FullWindowOverlay>{children}</FullWindowOverlay>), []) : undefined;

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      backdropComponent={renderBackdrop}
      onChange={(index: number) => props.onChangeIndex?.(index)}
      containerComponent={renderContainerComponent}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
      keyboardBlurBehavior={'restore'}
      onDismiss={handleSheetDismiss}
    >
      <BottomSheetScrollView style={styles.root} keyboardShouldPersistTaps="always">
        <Header
          title={props.flashcardId ? t('editFlashcard') : t('addNewFlashcard')}
          subtitle={t('wordAndTranslation')}
          style={{ marginVertical: 10 }}
        />
        {status && statusMessage &&
          <Alert
            title={status == 'success' ? t('success') : t('invalidData')}
            message={statusMessage}
            type={status}
          />
        }
        <WordInput
          ref={wordInputRef}
          word={word}
          onWordCommit={setWord}
          onWordChange={setCurrentWord}
          languageCode={mainLang}
          style={{ marginTop: 15 }}
          pointerEvents="box-only"
        />
        <WordInput
          ref={translationInputRef}
          word={translation}
          suggestions={suggestions}
          onWordCommit={setTranslation}
          languageCode={translationLang}
          style={{ marginTop: 15 }}
          pointerEvents="box-only"
        />
        <ActionButton
          onPress={() => props.flashcardId ? editFlashcard() : addFlashcard(false)}
          label={props.flashcardId ? t('edit') : t('add_1')}
          primary={true}
          active={buttonsActive}
          style={styles.button}
          icon={props.flashcardId ? 'save-sharp' : undefined}
        />
        {props.flashcardId ? <View style={{ height: MARGIN_VERTICAL }}/> :
          <CustomText
            style={styles.actionText}
            weight={'SemiBold'}
            onPress={() => {
              if (buttonsActive) addFlashcard(true);
            }}
          >
            {t('addAnother')}
          </CustomText>}
      </BottomSheetScrollView>
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