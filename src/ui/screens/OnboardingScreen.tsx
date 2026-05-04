import React, { Activity, useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from 'react-native-paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchExampleFlashcards, updateUserLanguages } from '../../api/apiClient';
import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { LanguageTypes } from '../../constants/Language';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useAuth, useLanguage } from '../../store';
import { ExampleFlashcard, LanguageLevelRange } from '../../types';
import { trackEvent } from '../../utils/analytics';
import { ActionButton } from '../components';
import { FlashcardsSelectionContainer, LanguageLevelPicker, LanguagePicker } from '../containers';
import { SameLearningLanguageBottomSheet } from '../sheets';
import { CustomTheme } from '../Theme';

const SAME_LANGUAGE_SHEET = 'onboarding-same-language-sheet';
const TOTAL_STEPS = 5;

export const OnboardingScreen = () => {
    const { colors } = useTheme() as CustomTheme;
    const { getSession } = useAuth();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [wordsLoading, setWordsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [exampleWords, setExampleWords] = useState<ExampleFlashcard[]>([]);
    const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);

    const { languages, mainLang, translationLang } = useLanguage();
    const [pickedLevel, setPickedLevel] = useState<LanguageLevelRange | undefined>();
    const fetchControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        setPickedLevel(undefined);
    }, [mainLang]);

    useEffect(() => {
        setExampleWords([]);
    }, [pickedLevel]);

    const buttonEnabled =
        (currentStep === 0 && !!translationLang) ||
        (currentStep === 1 && !!mainLang) ||
        (currentStep === 2 && !!pickedLevel) ||
        (currentStep === 3 && !wordsLoading);

    useEffect(() => {
        trackEvent(AnalyticsEventName.ONBOARDING_INITIALIZED);
    }, []);

    const handleWordToggle = useCallback((id: string) => {
        setSelectedWordIds(prev =>
            prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id],
        );
    }, []);

    const handleBackPress = useCallback(() => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    }, [currentStep]);

    const updateUserData = useCallback(async () => {
        setLoading(true);
        // TODO: pass selectedWordIds to account configuration endpoint
        const res = await updateUserLanguages(mainLang, translationLang, pickedLevel ?? 1);
        if (res) {
            trackEvent(AnalyticsEventName.ONBOARDING_FINISHED);
            await getSession();
        }
        setLoading(false);
    }, [mainLang, translationLang, pickedLevel]);

    const handleContinuePress = useCallback(() => {
        if (currentStep === 1 && mainLang === translationLang) {
            TrueSheet.present(SAME_LANGUAGE_SHEET);
        } else if (currentStep === 2) {
            setCurrentStep(3);
            if (exampleWords.length === 0) {
                fetchControllerRef.current?.abort();
                fetchControllerRef.current = new AbortController();
                setSelectedWordIds([]);
                setWordsLoading(true);
                fetchExampleFlashcards(
                    mainLang,
                    translationLang,
                    pickedLevel ?? 1,
                    fetchControllerRef.current.signal,
                )
                    .then(words => {
                        setExampleWords(words);
                        setWordsLoading(false);
                    })
                    .catch(err => {
                        if (err.name !== 'AbortError') setWordsLoading(false);
                    });
            }
        } else if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            updateUserData();
        }
    }, [currentStep, mainLang, translationLang, pickedLevel, exampleWords.length, updateUserData]);

    return (
        <>
            <SameLearningLanguageBottomSheet
                sheetName={SAME_LANGUAGE_SHEET}
                onConfirm={updateUserData}
            />
            <LinearGradient
                colors={[colors.card, colors.background]}
                end={{ x: 1, y: 1 }}
                start={{ x: 0, y: 0 }}
                style={styles.root}
            >
                <View style={styles.topBar}>
                    <View style={styles.progressBarWrapper}>
                        <ProgressBar
                            color={colors.primary}
                            progress={(currentStep + 1) / TOTAL_STEPS}
                            style={styles.progressBar}
                        />
                    </View>
                </View>

                <View style={styles.content}>
                    <Activity mode={currentStep === 0 ? 'visible' : 'hidden'}>
                        <LanguagePicker
                            alwaysAllowPick
                            languageType={LanguageTypes.TRANSLATION}
                            style={styles.languagePicker}
                            title={`1. ${t('choose_translation_language')}`}
                        />
                    </Activity>
                    <Activity mode={currentStep === 1 ? 'visible' : 'hidden'}>
                        <LanguagePicker
                            alwaysAllowPick
                            languageType={LanguageTypes.MAIN}
                            style={styles.languagePicker}
                            title={`2. ${t('choose_main_language')}`}
                        />
                    </Activity>
                    <Activity mode={currentStep === 2 ? 'visible' : 'hidden'}>
                        <LanguageLevelPicker
                            language={languages.find(lang => lang.languageCode === mainLang)}
                            pickedLevel={pickedLevel}
                            style={styles.languagePicker}
                            title={`3. ${t('language_level.select', { language: languages.find(lang => lang.languageCode === mainLang)?.languageName.toLowerCase() })}`}
                            updateUserData={false}
                            onLevelPick={setPickedLevel}
                        />
                    </Activity>
                    <Activity mode={currentStep === 3 ? 'visible' : 'hidden'}>
                        <FlashcardsSelectionContainer
                            loading={wordsLoading}
                            selectedIds={selectedWordIds}
                            style={styles.languagePicker}
                            title={`4. ${t('word_selection.title')}`}
                            words={exampleWords}
                            onSelectAll={setSelectedWordIds}
                            onToggle={handleWordToggle}
                        />
                    </Activity>
                </View>

                <View style={styles.bottomBar}>
                    <ActionButton
                        active={buttonEnabled}
                        icon={'arrow-forward-outline'}
                        label={t('continue')}
                        loading={loading}
                        primary={true}
                        onPress={handleContinuePress}
                    />
                    <ActionButton
                        active={currentStep > 0 && !loading}
                        icon={'arrow-back-outline'}
                        label={t('back')}
                        primary={false}
                        onPress={handleBackPress}
                    />
                </View>
            </LinearGradient>
        </>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        bottomBar: {
            backgroundColor: colors.card,
            gap: 10,
            paddingBottom: insets.bottom + MARGIN_VERTICAL / 2,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL,
        },
        content: {
            flex: 1,
        },
        languagePicker: {
            paddingTop: MARGIN_VERTICAL,
        },
        progressBar: {
            backgroundColor: colors.cardAccent,
            height: 5,
        },
        progressBarWrapper: {
            marginHorizontal: MARGIN_HORIZONTAL,
        },
        root: {
            flex: 1,
        },
        topBar: {
            paddingTop: insets.top + MARGIN_VERTICAL / 2,
        },
    });
