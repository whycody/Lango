import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { updateUserLanguages } from '../../api/apiClient';
import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { LanguageTypes } from '../../constants/Language';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useLanguage } from '../../store';
import { useAuth } from '../../store/AuthContext';
import { LanguageLevelRange } from '../../types';
import { trackEvent } from '../../utils/analytics';
import { ActionButton } from '../components';
import { OnboardingScreenContainer } from '../containers';
import { LanguageLevelPicker, LanguagePicker } from '../containers';
import { WelcomeScreen } from '.';

const screenHeight = Dimensions.get('window').height;

export const OnboardingScreen = () => {
    const { colors } = useTheme();
    const { getSession } = useAuth();
    const insets = useSafeAreaInsets();
    const styles = getStyles(insets);
    const { t } = useTranslation();
    const scrollViewRef = useRef<ScrollView>(null);

    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const backSlideAnim = useRef(new Animated.Value(30)).current;
    const backOpacityAnim = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(0)).current;

    const { languages, mainLang, translationLang } = useLanguage();
    const [welcomeScreenIsReady, setWelcomeScreenIsReady] = useState(false);
    const [pickedLevel, setPickedLevel] = useState<LanguageLevelRange | undefined>();

    const buttonEnabled =
        (currentStep === 0 && welcomeScreenIsReady) ||
        (currentStep === 1 && !!translationLang) ||
        (currentStep === 2 && !!mainLang) ||
        (currentStep === 3 && !!pickedLevel);

    useEffect(() => {
        trackEvent(AnalyticsEventName.ONBOARDING_INITIALIZED);
    }, []);

    const scrollToScreen = useCallback((screenIndex: number) => {
        const offsetY = screenIndex * (screenHeight + insets.top + insets.bottom);
        scrollViewRef.current?.scrollTo({
            animated: true,
            y: offsetY,
        });
        setCurrentStep(screenIndex);
    }, []);

    const triggerPulse = useCallback(() => {
        pulseAnim.setValue(0);
        Animated.sequence([
            Animated.timing(pulseAnim, {
                duration: 200,
                easing: Easing.out(Easing.quad),
                toValue: 1,
                useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
                duration: 200,
                easing: Easing.in(Easing.quad),
                toValue: 0,
                useNativeDriver: true,
            }),
        ]).start();
    }, [pulseAnim]);

    const handleBackPress = useCallback(() => {
        if (currentStep > 0) {
            triggerPulse();
            scrollToScreen(currentStep - 1);
        }
    }, [currentStep, scrollToScreen, triggerPulse]);

    const updateUserData = useCallback(async () => {
        setLoading(true);
        const res = await updateUserLanguages(mainLang, translationLang, pickedLevel);
        if (res) {
            trackEvent(AnalyticsEventName.ONBOARDING_FINISHED);
            await getSession();
        }
        setLoading(false);
    }, [mainLang, translationLang, pickedLevel]);

    const handleContinuePress = useCallback(() => {
        if (currentStep < 3) {
            triggerPulse();
            scrollToScreen(currentStep + 1);
        } else updateUserData();
    }, [currentStep, scrollToScreen, triggerPulse, updateUserData]);

    useEffect(() => {
        if (currentStep > 0) {
            backSlideAnim.setValue(30);
            backOpacityAnim.setValue(0);

            Animated.parallel([
                Animated.timing(backSlideAnim, {
                    duration: 300,
                    easing: Easing.out(Easing.quad),
                    toValue: 0,
                    useNativeDriver: true,
                }),
                Animated.timing(backOpacityAnim, {
                    duration: 300,
                    easing: Easing.out(Easing.quad),
                    toValue: 1,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            backSlideAnim.setValue(0);
            backOpacityAnim.setValue(1);

            Animated.parallel([
                Animated.timing(backSlideAnim, {
                    duration: 300,
                    easing: Easing.in(Easing.quad),
                    toValue: 30,
                    useNativeDriver: true,
                }),
                Animated.timing(backOpacityAnim, {
                    duration: 300,
                    easing: Easing.in(Easing.quad),
                    toValue: 0,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [currentStep === 0, backSlideAnim, backOpacityAnim]);

    const languageTypes = [LanguageTypes.TRANSLATION, LanguageTypes.MAIN];

    return (
        <>
            <ScrollView
                pagingEnabled
                ref={scrollViewRef}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
            >
                <LinearGradient
                    colors={[colors.background, colors.card]}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0.5, y: 0.5 }}
                    style={styles.fullScreenSection}
                >
                    <OnboardingScreenContainer currentStep={currentStep}>
                        <WelcomeScreen onAnimationEnd={() => setWelcomeScreenIsReady(true)} />
                    </OnboardingScreenContainer>
                </LinearGradient>

                {languageTypes.map((type, index) => (
                    <LinearGradient
                        key={type}
                        colors={[colors.background, colors.card]}
                        end={{ x: index, y: index }}
                        start={{ x: 1 - index, y: 1 - index }}
                    >
                        <OnboardingScreenContainer currentStep={currentStep}>
                            <LanguagePicker
                                alwaysAllowPick
                                languageType={type}
                                style={styles.languagePicker}
                            />
                        </OnboardingScreenContainer>
                    </LinearGradient>
                ))}

                <LinearGradient
                    colors={[colors.background, colors.card]}
                    end={{ x: 0, y: 0 }}
                    start={{ x: 0.5, y: 0.5 }}
                    style={styles.fullScreenSection}
                >
                    <OnboardingScreenContainer currentStep={currentStep}>
                        <LanguageLevelPicker
                            language={languages.find(lang => lang.languageCode === mainLang)}
                            pickedLevel={pickedLevel}
                            style={styles.languagePicker}
                            updateUserData={false}
                            onLevelPick={setPickedLevel}
                        />
                    </OnboardingScreenContainer>
                </LinearGradient>
            </ScrollView>

            <View style={styles.buttonContainer}>
                {currentStep > 0 && (
                    <Animated.View
                        style={{
                            opacity: backOpacityAnim,
                            transform: [{ translateY: backSlideAnim }],
                        }}
                    >
                        <ActionButton
                            active={!loading}
                            icon={'arrow-back-outline'}
                            label={t('back')}
                            primary={false}
                            style={styles.backButton}
                            onPress={handleBackPress}
                        />
                    </Animated.View>
                )}
                <ActionButton
                    active={buttonEnabled}
                    icon={'arrow-forward-outline'}
                    label={t('continue')}
                    loading={loading}
                    primary={true}
                    onPress={handleContinuePress}
                />
            </View>
        </>
    );
};

const getStyles = (insets: any) =>
    StyleSheet.create({
        backButton: {
            marginBottom: MARGIN_VERTICAL / 2,
        },
        buttonContainer: {
            bottom: 0,
            left: 0,
            paddingBottom: insets.bottom + MARGIN_VERTICAL / 2,
            paddingHorizontal: MARGIN_HORIZONTAL,
            position: 'absolute',
            right: 0,
        },
        fullScreenSection: {
            flex: 1,
        },
        languagePicker: {
            flex: 1,
            height: screenHeight + insets.top + insets.bottom,
            paddingTop: insets.top + MARGIN_VERTICAL,
            width: '100%',
        },
        root: {
            flex: 1,
        },
    });
