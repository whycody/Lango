import React, { Activity, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from 'react-native-paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchExampleFlashcards, updateUserData } from '../../api/apiClient';
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
    const [flashcardsLoading, setFlashcardsLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [exampleFlashcards, setExampleFlashcards] = useState<ExampleFlashcard[]>([]);
    const [selectedFlashcardsIds, setSelectedFlashcardsIds] = useState<string[]>([]);
    const [displayedFlashcardsIds, setDisplayedFlashcardsIds] = useState<string[]>([]);

    const { languages, mainLang, translationLang } = useLanguage();
    const [pickedLevel, setPickedLevel] = useState<LanguageLevelRange | undefined>();

    useEffect(() => {
        setPickedLevel(undefined);
    }, [mainLang]);

    useEffect(() => {
        setExampleFlashcards([]);
        setDisplayedFlashcardsIds([]);
    }, [pickedLevel]);

    useEffect(() => {
        if (currentStep !== 3 || exampleFlashcards.length > 0) return;

        const controller = new AbortController();
        setSelectedFlashcardsIds([]);
        setDisplayedFlashcardsIds([]);
        setFlashcardsLoading(true);

        fetchExampleFlashcards(mainLang, translationLang, pickedLevel ?? 1, 15, controller.signal)
            .then(flashcards => {
                if (flashcards) setExampleFlashcards(flashcards);
                setFlashcardsLoading(false);
            })
            .catch(err => {
                if (err.name !== 'AbortError') setFlashcardsLoading(false);
            });

        return () => controller.abort();
    }, [currentStep, mainLang, translationLang, pickedLevel, exampleFlashcards.length]);

    const buttonEnabled =
        (currentStep === 0 && !!translationLang) ||
        (currentStep === 1 && !!mainLang) ||
        (currentStep === 2 && !!pickedLevel) ||
        (currentStep === 3 && !flashcardsLoading);

    useEffect(() => {
        trackEvent(AnalyticsEventName.ONBOARDING_INITIALIZED);
    }, []);

    const handleFlashcardToggle = (id: string) => {
        setSelectedFlashcardsIds(prev =>
            prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id],
        );
    };

    const handleBackPress = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleLastVisibleIndexChange = (index: number) => {
        if (index < 0) return;
        setDisplayedFlashcardsIds(prev => {
            const newVisible = exampleFlashcards.slice(0, index + 1).map(w => w.id);
            const merged = Array.from(new Set([...prev, ...newVisible]));
            return merged.length !== prev.length ? merged : prev;
        });
    };

    const updateUserOnboardingData = async () => {
        setLoading(true);
        const skippedFlashcardsIds = displayedFlashcardsIds.filter(
            id => !selectedFlashcardsIds.includes(id),
        );
        const res = await updateUserData(
            mainLang,
            translationLang,
            pickedLevel ?? 1,
            selectedFlashcardsIds,
            skippedFlashcardsIds,
        );
        if (res) {
            trackEvent(AnalyticsEventName.ONBOARDING_FINISHED);
            await getSession();
        }
        setLoading(false);
    };

    const handleContinuePress = () => {
        if (currentStep === 1 && mainLang === translationLang) {
            TrueSheet.present(SAME_LANGUAGE_SHEET);
        } else if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            updateUserOnboardingData();
        }
    };

    return (
        <>
            <SameLearningLanguageBottomSheet
                sheetName={SAME_LANGUAGE_SHEET}
                onConfirm={updateUserOnboardingData}
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
                            flashcards={exampleFlashcards}
                            loading={flashcardsLoading}
                            selectedIds={selectedFlashcardsIds}
                            style={styles.languagePicker}
                            title={`4. ${t('word_selection.title')}`}
                            onLastVisibleIndexChange={handleLastVisibleIndexChange}
                            onSelectAll={setSelectedFlashcardsIds}
                            onToggle={handleFlashcardToggle}
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
