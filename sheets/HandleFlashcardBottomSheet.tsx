import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useTheme } from "@react-navigation/native";
import { Keyboard, Platform, StyleSheet, View } from "react-native";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../src/constants";
import CustomText from "../components/CustomText";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import { USER, useWords, Word } from "../store/WordsContext";
import WordInput from "../components/WordInput";
import Alert from "../components/Alert";
import * as Haptics from "expo-haptics";
import Header from "../components/Header";
import { FullWindowOverlay } from "react-native-screens";
import { useLanguage } from "../hooks/useLanguage";

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

  const [status, setStatus] = useState<'error' | 'success' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [buttonsActive, setButtonsActive] = useState(true);
  const languageContext = useLanguage();

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
    const word = wordInputRef.current?.getWord().trim();
    const translation = translationInputRef.current?.getWord().trim();
    wordsContext.editWord(props.flashcardId, word, translation);
    props.onWordEdit?.(props.flashcardId, word, translation);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    setStatusMessage(t('editWord', { word: word }));
    scheduleDismiss()
  }

  const addFlashcard = (multiple: boolean) => {
    if (!validateInputs()) return;
    const word = wordInputRef.current?.getWord().trim();
    const translation = translationInputRef.current?.getWord().trim();
    wordsContext.addWord(word, translation, USER);
    setStatusMessage(t('addNewWord', { word: word }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    if (!multiple) {
      scheduleDismiss();
    } else {
      clearInputs();
      setStatus('success');
      wordInputRef.current?.focus();
    }
  }

  const scheduleDismiss = () => {
    Keyboard.dismiss();
    setTimeout(() => setStatus('success'), 50);
    setTimeout(() => ref.current?.dismiss(), 1500);
    setButtonsActive(false);
  }

  const handleSheetDismiss = () => {
    clearStatus();
    setButtonsActive(true);
    if (!props.flashcardId) clearInputs();
  }

  const renderContainerComponent = Platform.OS === "ios" ? useCallback(({ children }: any) => (
    <FullWindowOverlay>{children}</FullWindowOverlay>), []) : undefined;

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      backdropComponent={renderBackdrop}
      containerComponent={renderContainerComponent}
      backgroundStyle={{ backgroundColor: colors.card }}
      handleIndicatorStyle={{ backgroundColor: colors.primary, borderRadius: 0 }}
      onDismiss={handleSheetDismiss}
    >
      <BottomSheetView style={styles.root}>
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
          onWordChange={setWord}
          languageCode={languageContext.mainLangCode}
          style={{ marginTop: 15 }}
        />
        <WordInput
          ref={translationInputRef}
          word={translation}
          onWordChange={setTranslation}
          languageCode={languageContext.studyingLangCode}
          style={{ marginTop: 15 }}
        />
        <ActionButton
          onPress={() => props.flashcardId ? editFlashcard() : addFlashcard(false)}
          label={props.flashcardId ? t('edit') : t('add')}
          primary={true}
          active={buttonsActive}
          style={styles.button}
          icon={'save-sharp'}
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