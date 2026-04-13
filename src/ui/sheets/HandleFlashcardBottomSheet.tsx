import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { translateText } from '../../api/apiClient';
import { BOTTOM_SHEET_GRABBER_OPTIONS } from '../../constants/Common';
import { LanguageCode } from '../../constants/Language';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { WordSource } from '../../constants/Word';
import { useVoiceInput } from '../../hooks';
import { useLanguage, useWords } from '../../store';
import { Word } from '../../types';
import { ActionButton, CustomText, Header } from '../components';
import { Alert, WordInput } from '../components/flashcards';
import { CustomTheme } from '../Theme';
import { MicrophonePermissionBottomSheet } from './MicrophonePermissionBottomSheet';

type WordTranslations = {
    from: LanguageCode;
    to: LanguageCode;
    translations: string[];
    word: string;
};

type HandleFlashcardBottomSheetProps = {
    flashcardId?: string;
    sheetName: string;
    onWordEdit?: (id: string, word: string, translation: string) => void;
};

const MICROPHONE_PERMISSION_SHEET_NAME = 'handle-flashcard-microphone-permission';

export const HandleFlashcardBottomSheet = (props: HandleFlashcardBottomSheetProps) => {
    const { flashcardId, onWordEdit, sheetName } = props;
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
    const { t } = useTranslation();
    const { addWord, editWord, getWord } = useWords();

    const wordInputRef = useRef<any>(null);
    const translationInputRef = useRef<any>(null);

    const flashcard: Word | null = flashcardId ? (getWord(flashcardId) ?? null) : null;
    const [word, setWord] = useState(flashcard?.text ?? '');
    const [translation, setTranslation] = useState(flashcard?.translation ?? '');

    const [currentWord, setCurrentWord] = useState<string>('');
    const [currentTranslation, setCurrentTranslation] = useState<string>('');
    const [wordTranslations, setWordTranslations] = useState<WordTranslations[]>([]);

    const [status, setStatus] = useState<'error' | 'success' | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [buttonsActive, setButtonsActive] = useState(true);
    const { mainLang, translationLang } = useLanguage();
    const voice = useVoiceInput({});

    const translationsOfWord =
        wordTranslations &&
        wordTranslations.find(
            wt =>
                wt.word.toLowerCase() === currentWord.toLowerCase() &&
                wt.from == mainLang &&
                wt.to == translationLang,
        );
    const translationsOfTranslation =
        wordTranslations &&
        wordTranslations.find(
            wt =>
                wt.word.toLowerCase() === currentTranslation.toLowerCase() &&
                wt.from == translationLang &&
                wt.to == mainLang,
        );

    const translationSuggestions = translationsOfWord ? translationsOfWord.translations : [];
    const wordSuggestions = translationsOfTranslation ? translationsOfTranslation.translations : [];

    const clearInputs = () => {
        setCurrentWord('');
        setCurrentTranslation('');
    };

    const clearStatus = () => {
        setStatus(null);
        setStatusMessage(null);
    };

    useEffect(() => {
        if (!flashcardId) {
            clearInputs();
        } else {
            const currentFlashcard = getWord(flashcardId);
            if (!currentFlashcard) return;

            setWord(currentFlashcard.text);
            setTranslation(currentFlashcard.translation);
            setCurrentWord(currentFlashcard.text);
            setCurrentTranslation(currentFlashcard.translation);
        }
    }, [flashcardId]);

    const getCurrentWordAndTranslation = () => {
        const word =
            currentWord.length > 0
                ? currentWord.trim()
                : wordSuggestions.length > 0
                  ? wordSuggestions[0].trim()
                  : '';
        const translation =
            currentTranslation.length > 0
                ? currentTranslation.trim()
                : translationSuggestions.length > 0
                  ? translationSuggestions[0].trim()
                  : '';

        return { translation, word };
    };

    const validateInputs = () => {
        const { translation, word } = getCurrentWordAndTranslation();
        if (word && translation) return true;
        setStatus('error');
        setStatusMessage(t('bothInputs'));
        return false;
    };

    const editFlashcard = () => {
        if (!validateInputs() || !flashcardId) return;
        scheduleDismiss();
        const { translation, word } = getCurrentWordAndTranslation();
        editWord({
            id: flashcardId,
            text: word,
            translation,
        });
        onWordEdit?.(flashcardId, word, translation);
        setStatusMessage(t('editWord', { word }));
    };

    const addFlashcard = (multiple: boolean) => {
        if (!validateInputs()) return;
        const { translation, word } = getCurrentWordAndTranslation();
        const newWord = addWord(word, translation, WordSource.USER);

        if (!newWord) {
            setStatus('error');
            setStatusMessage(t('alreadyExists'));
            return;
        }

        setStatusMessage(t('addNewWord', { word }));
        if (!multiple) {
            scheduleDismiss();
        } else {
            setCurrentTranslation('');
            setCurrentWord('');
            setTimeout(() => {
                clearInputs();
                setStatus('success');
                wordInputRef.current?.focus();
            }, 10);
        }
    };

    const scheduleDismiss = () => {
        setStatus('success');
        setTimeout(() => Keyboard.dismiss(), 950);
        setTimeout(() => TrueSheet.dismiss(sheetName), 1000);
        setButtonsActive(false);
    };

    const handleSheetDismiss = () => {
        clearStatus();
        setButtonsActive(true);
        if (!flashcardId) clearInputs();
    };

    const wordDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const translationDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortControllerRef = useRef(new AbortController());

    useEffect(() => {
        if (wordDebounceRef.current) clearTimeout(wordDebounceRef.current);
        wordDebounceRef.current = setTimeout(() => setWord(currentWord), 450);
        return () => {
            if (wordDebounceRef.current) clearTimeout(wordDebounceRef.current);
        };
    }, [currentWord]);

    useEffect(() => {
        if (translationDebounceRef.current) clearTimeout(translationDebounceRef.current);
        translationDebounceRef.current = setTimeout(() => setTranslation(currentTranslation), 450);
        return () => {
            if (translationDebounceRef.current) clearTimeout(translationDebounceRef.current);
        };
    }, [currentTranslation]);

    const translateWord = async (text: string, from = mainLang, to = translationLang) => {
        abortControllerRef.current && abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        try {
            const translations = await translateText(
                text,
                from,
                to,
                abortControllerRef.current.signal,
            );
            setWordTranslations(prev => [
                ...prev,
                {
                    from,
                    to,
                    translations: [translations.toLowerCase()],
                    word: text,
                },
            ]);
        } catch (error: unknown) {
            if (!axios.isCancel(error)) {
                if (axios.isAxiosError(error)) {
                    console.error(
                        'Błąd:',
                        error.response?.status,
                        error.response?.data ?? error.message,
                    );
                } else {
                    console.error('Błąd:', error);
                }
            }
        }
    };

    useEffect(() => {
        if (mainLang == translationLang) return;
        if (!!word && !translation) translateWord(word);
        if (!!translation && !word) translateWord(translation, translationLang, mainLang);
    }, [word, translation, mainLang, translationLang]);

    const handleDidDismiss = () => {
        voice.stop();
        handleSheetDismiss();
    };

    const handleActionButtonPress = () => {
        if (!buttonsActive) return;
        addFlashcard(true);
    };

    return (
        <>
            <MicrophonePermissionBottomSheet sheetName={MICROPHONE_PERMISSION_SHEET_NAME} />
            <TrueSheet
                backgroundColor={colors.card}
                cornerRadius={24}
                detents={['auto']}
                dimmed={true}
                grabberOptions={BOTTOM_SHEET_GRABBER_OPTIONS}
                name={sheetName}
                onDidDismiss={handleDidDismiss}
            >
                <View style={styles.root}>
                    <Header
                        style={styles.headerMargin}
                        subtitle={t('wordAndTranslation')}
                        title={flashcardId ? t('editFlashcard') : t('addNewFlashcard')}
                    />
                    {status && statusMessage && (
                        <Alert
                            message={statusMessage}
                            title={status == 'success' ? t('success') : t('invalidData')}
                            type={status}
                        />
                    )}
                    <WordInput
                        active={buttonsActive}
                        cursorColor={!buttonsActive ? 'transparent' : colors.primary}
                        id={'main-input'}
                        languageCode={mainLang}
                        pointerEvents="box-only"
                        ref={wordInputRef}
                        style={styles.wordInput}
                        suggestions={wordSuggestions}
                        word={currentWord}
                        onWordChange={setCurrentWord}
                        onMicrophonePermissionsNotGranted={() =>
                            TrueSheet.present(MICROPHONE_PERMISSION_SHEET_NAME)
                        }
                    />
                    <WordInput
                        active={buttonsActive}
                        id={'translation-input'}
                        languageCode={translationLang}
                        pointerEvents="box-only"
                        ref={translationInputRef}
                        style={styles.wordInput}
                        suggestions={translationSuggestions}
                        word={currentTranslation}
                        onWordChange={setCurrentTranslation}
                        onMicrophonePermissionsNotGranted={() =>
                            TrueSheet.present(MICROPHONE_PERMISSION_SHEET_NAME)
                        }
                    />
                    <ActionButton
                        active={buttonsActive}
                        icon={flashcardId ? 'save-sharp' : undefined}
                        label={flashcardId ? t('edit') : t('add_1')}
                        primary={true}
                        style={styles.button}
                        onPress={() => (flashcardId ? editFlashcard() : addFlashcard(false))}
                    />
                    {!flashcardId ? (
                        <CustomText
                            style={styles.actionText}
                            weight={'SemiBold'}
                            onPress={handleActionButtonPress}
                        >
                            {t('addAnother')}
                        </CustomText>
                    ) : (
                        <View style={styles.bottomSpacer} />
                    )}
                </View>
            </TrueSheet>
        </>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        actionText: {
            color: colors.primary,
            fontSize: 13,
            paddingVertical: MARGIN_VERTICAL,
            textAlign: 'center',
        },
        bottomSpacer: {
            height: MARGIN_VERTICAL,
        },
        button: {
            marginTop: MARGIN_VERTICAL,
        },
        header: {},
        headerMargin: {
            marginVertical: 10,
        },
        root: {
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL,
        },
        wordInput: {
            marginTop: 15,
        },
    });
