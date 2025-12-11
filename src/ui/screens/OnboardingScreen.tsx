import LanguagePicker from "../components/LanguagePicker";
import OnboardingScreenContainer from "../components/OnboardingScreenContainer";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import { useAuth } from "../../api/auth/AuthProvider";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { LanguageTypes } from "../../constants/LanguageTypes";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import { View, ScrollView, StyleSheet, Dimensions, Animated, Easing } from "react-native";
import WelcomeScreen from "./WelcomeScreen";
import { LinearGradient } from "expo-linear-gradient";
import { useLanguage } from "../../store/LanguageContext";
import { updateUserLanguages } from "../../api/apiClient";

const screenHeight = Dimensions.get('window').height;

const OnboardingScreen = () => {
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

  const { mainLang, translationLang } = useLanguage();
  const [welcomeScreenIsReady, setWelcomeScreenIsReady] = useState(false);
  const buttonEnabled = currentStep === 0 && welcomeScreenIsReady || currentStep === 1 && !!mainLang ||
    currentStep === 2 && !!translationLang;

  const scrollToScreen = useCallback((screenIndex: number) => {
    const offsetY = screenIndex * (screenHeight + insets.top + insets.bottom);
    scrollViewRef.current?.scrollTo({
      y: offsetY,
      animated: true,
    });
    setCurrentStep(screenIndex);
  }, []);

  const triggerPulse = useCallback(() => {
    pulseAnim.setValue(0);
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      })
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
    const res = await updateUserLanguages(mainLang, translationLang);
    if (!!res) await getSession();
    setLoading(false);
  }, [mainLang, translationLang]);

  const handleContinuePress = useCallback(() => {
    if (currentStep < 2) {
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
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(backOpacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ]).start();
    } else {
      backSlideAnim.setValue(0);
      backOpacityAnim.setValue(1);

      Animated.parallel([
        Animated.timing(backSlideAnim, {
          toValue: 30,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(backOpacityAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [currentStep === 0, backSlideAnim, backOpacityAnim]);

  const languages = [LanguageTypes.MAIN, LanguageTypes.TRANSLATION];

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        pagingEnabled
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingScreenContainer currentStep={currentStep}>
          <WelcomeScreen onAnimationEnd={() => setWelcomeScreenIsReady(true)}/>
        </OnboardingScreenContainer>

        {languages.map((type, index) => (
          <LinearGradient
            key={type}
            colors={[colors.background, colors.card]}
            start={{ x: index, y: index }}
            end={{ x: 1 - index, y: 1 - index }}
          >
            <OnboardingScreenContainer currentStep={currentStep}>
              <LanguagePicker
                languageType={type}
                style={styles.languagePicker}
              />
            </OnboardingScreenContainer>
          </LinearGradient>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <Animated.View style={[
            {
              transform: [{ translateY: backSlideAnim }],
              opacity: backOpacityAnim,
            }
          ]}>
            <ActionButton
              label={t('back')}
              primary={false}
              active={!loading}
              style={styles.backButton}
              icon={'arrow-back-outline'}
              onPress={handleBackPress}
            />
          </Animated.View>
        )}
        <ActionButton
          label={t('continue')}
          primary={true}
          icon={'arrow-forward-outline'}
          onPress={handleContinuePress}
          loading={loading}
          active={buttonEnabled}
        />
      </View>
    </>
  );
}

const getStyles = (insets: any) => StyleSheet.create({
  root: {
    flex: 1,
  },
  languagePicker: {
    flex: 1,
    paddingTop: insets.top + MARGIN_VERTICAL,
    height: screenHeight + insets.top + insets.bottom,
    width: '100%',
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingBottom: insets.bottom + MARGIN_VERTICAL / 2,
  },
  backButton: {
    marginBottom: MARGIN_VERTICAL / 2,
  },
});

export default OnboardingScreen;