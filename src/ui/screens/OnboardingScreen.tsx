import React, { Activity, useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchExampleFlashcards, updateUserData } from '../../api/apiClient';
import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { LanguageCode, LanguageTypes } from '../../constants/Language';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useAuth, useLanguage } from '../../store';
import { ExampleFlashcard, LanguageLevelRange } from '../../types';
import { trackEvent } from '../../utils/analytics';
import { isSupportedLanguageCode } from '../../utils/languageUtils';
import { ActionButton } from '../components';
import { OnboardingHeader } from '../components/onboarding';
import { FlashcardsSelectionContainer, LanguageLevelPicker, LanguagePicker } from '../containers';
import {
    LogoutBottomSheet,
    SameLearningLanguageBottomSheet,
    SkipFlashcardsBottomSheet,
} from '../sheets';
import { CustomTheme } from '../Theme';

const SAME_LANGUAGE_SHEET = 'onboarding-same-language-sheet';
const LOGOUT_SHEET = 'onboarding-logout-sheet';
const SKIP_FLASHCARDS_SHEET = 'onboarding-skip-flashcards-sheet';
const TOTAL_STEPS = 5;

export const OnboardingScreen = () => {
    const { colors } = useTheme() as CustomTheme;
    const { getSession } = useAuth();
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [flashcardsLoading, setFlashcardsLoading] = useState(false);
    const [flashcardsError, setFlashcardsError] = useState(false);
    const [flashcardsErrorMessage, setFlashcardsErrorMessage] = useState<string | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [exampleFlashcards, setExampleFlashcards] = useState<ExampleFlashcard[]>([]);
    const [selectedFlashcardsIds, setSelectedFlashcardsIds] = useState<string[]>([]);
    const [displayedFlashcardsIds, setDisplayedFlashcardsIds] = useState<string[]>([]);

    const { languages, mainLang, setTranslationLang, translationLang } = useLanguage();
    const [pickedLevel, setPickedLevel] = useState<LanguageLevelRange | undefined>();

    useEffect(() => {
        if (translationLang) return;
        const deviceLang = getLocales()[0]?.languageCode;
        if (isSupportedLanguageCode(deviceLang)) setTranslationLang(deviceLang as LanguageCode);
    }, []);

    useEffect(() => {
        setPickedLevel(undefined);
    }, [mainLang]);

    useEffect(() => {
        setExampleFlashcards([]);
        setDisplayedFlashcardsIds([]);
        setFlashcardsError(false);
        setFlashcardsErrorMessage(null);
    }, [pickedLevel]);

    useEffect(() => {
        if (currentStep !== 3 || exampleFlashcards.length > 0) return;

        const controller = new AbortController();
        setSelectedFlashcardsIds([]);
        setDisplayedFlashcardsIds([]);
        setFlashcardsLoading(true);
        setFlashcardsError(false);
        setFlashcardsErrorMessage(null);

        fetchExampleFlashcards(mainLang, translationLang, pickedLevel ?? 1, 15, controller.signal)
            .then(flashcards => {
                if (flashcards.length > 0) {
                    setExampleFlashcards(flashcards);
                } else {
                    setFlashcardsError(true);
                }
                setFlashcardsLoading(false);
            })
            .catch(err => {
                if (err?.code === 'ERR_CANCELED') return;
                setFlashcardsError(true);
                setFlashcardsErrorMessage(err?.response?.data?.error ?? null);
                setFlashcardsLoading(false);
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

    const handleLastVisibleIndexChange = useCallback(
        (index: number) => {
            if (index < 0) return;
            setDisplayedFlashcardsIds(prev => {
                const newVisible = exampleFlashcards.slice(0, index + 1).map(w => w.id);
                const merged = Array.from(new Set([...prev, ...newVisible]));
                return merged.length !== prev.length ? merged : prev;
            });
        },
        [exampleFlashcards],
    );

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

    const mainLanguageName = languages
        .find(lang => lang.languageCode === mainLang)
        ?.languageName.toLowerCase();

    const stepTitles = [
        t('choose_translation_language'),
        t('choose_main_language'),
        t('language_level.select', { language: mainLanguageName }),
        t('word_selection.title'),
    ];

    const stepTitle = (index: number) => `${index + 1}. ${stepTitles[index]}`;

    const handleContinuePress = () => {
        if (currentStep === 1 && mainLang === translationLang) {
            TrueSheet.present(SAME_LANGUAGE_SHEET);
        } else if (
            currentStep === 3 &&
            exampleFlashcards.length > 0 &&
            selectedFlashcardsIds.length === 0
        ) {
            TrueSheet.present(SKIP_FLASHCARDS_SHEET);
        } else if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        } else {
            updateUserOnboardingData();
        }
    };

    return (
        <>
            <LogoutBottomSheet sheetName={LOGOUT_SHEET} />
            <SkipFlashcardsBottomSheet
                sheetName={SKIP_FLASHCARDS_SHEET}
                onConfirm={updateUserOnboardingData}
            />
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
                <OnboardingHeader
                    currentStep={currentStep}
                    totalSteps={TOTAL_STEPS}
                    onLogout={() => TrueSheet.present(LOGOUT_SHEET)}
                />

                <View style={styles.content}>
                    <Activity mode={currentStep === 0 ? 'visible' : 'hidden'}>
                        <LanguagePicker
                            alwaysAllowPick
                            languageType={LanguageTypes.TRANSLATION}
                            style={styles.languagePicker}
                            title={stepTitle(0)}
                        />
                    </Activity>
                    <Activity mode={currentStep === 1 ? 'visible' : 'hidden'}>
                        <LanguagePicker
                            alwaysAllowPick
                            languageType={LanguageTypes.MAIN}
                            style={styles.languagePicker}
                            title={stepTitle(1)}
                        />
                    </Activity>
                    <Activity mode={currentStep === 2 ? 'visible' : 'hidden'}>
                        <LanguageLevelPicker
                            language={languages.find(lang => lang.languageCode === mainLang)}
                            pickedLevel={pickedLevel}
                            style={styles.languagePicker}
                            title={stepTitle(2)}
                            updateUserData={false}
                            onLevelPick={setPickedLevel}
                        />
                    </Activity>
                    <Activity mode={currentStep === 3 ? 'visible' : 'hidden'}>
                        <FlashcardsSelectionContainer
                            error={flashcardsError}
                            errorMessage={flashcardsErrorMessage}
                            flashcards={exampleFlashcards}
                            loading={flashcardsLoading}
                            selectedIds={selectedFlashcardsIds}
                            style={styles.languagePicker}
                            title={stepTitle(3)}
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
        root: {
            flex: 1,
        },
    });
