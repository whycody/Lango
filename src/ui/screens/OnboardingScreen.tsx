import LanguagePicker from "../components/LanguagePicker";
import { useTheme } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomText from "../components/CustomText";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import { useAuth } from "../../api/auth/AuthProvider";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { LanguageCode } from "../../constants/LanguageCode";
import { LanguageTypes } from "../../constants/LanguageTypes";
import ActionButton from "../components/ActionButton";
import { useTranslation } from "react-i18next";
import { View, ScrollView, StyleSheet, Dimensions, Animated, Easing, Text } from "react-native";
import LottieView from "lottie-react-native";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const OnboardingScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const contentScaleAnim = useRef(new Animated.Value(0.8)).current;
  const backSlideAnim = useRef(new Animated.Value(30)).current;
  const backOpacityAnim = useRef(new Animated.Value(0)).current;
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleSlideAnim = useRef(new Animated.Value(20)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<LottieView>();

  const fullText = `${user.name.split(' ')[0]},\n witaj w Lango! 🎉`;

  const scrollToScreen = useCallback((screenIndex: number) => {
    const offsetY = screenIndex * screenHeight;
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

  const handleMainLangPick = useCallback(() => {
    scrollToScreen(1);
  }, [scrollToScreen]);

  const handleTranslationLangPick = useCallback(() => {
    scrollToScreen(2);
  }, [scrollToScreen]);

  const handleBackPress = useCallback(() => {
    if (currentStep > 0) {
      triggerPulse();
      scrollToScreen(currentStep - 1);
    }
  }, [currentStep, scrollToScreen, triggerPulse]);

  const handleContinuePress = useCallback(() => {
    triggerPulse();
    scrollToScreen(currentStep + 1);
  }, [currentStep, scrollToScreen, triggerPulse]);

  // Animacja pisania tekstu (typewriter effect) na ekranie 0
  useEffect(() => {
    setDisplayedText('');
    let currentIndex = 0;
    let typeInterval: NodeJS.Timeout;

    const startTyping = () => {
      typeInterval = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setDisplayedText(fullText.substring(0, currentIndex));
          currentIndex++;
        } else {
          confettiRef.current?.play(0);
          clearInterval(typeInterval);
        }
      }, 100);
    };

    const delayTimeout = setTimeout(startTyping, 500);

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(typeInterval);
    };
  }, [fullText]);

  // Migający kursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500); // Miga co 500ms

    return () => clearInterval(cursorInterval);
  }, []);

  // Animacja subtitle gdy tekst się skończy
  useEffect(() => {
    if (displayedText.length === fullText.length) {
      subtitleFadeAnim.setValue(0);
      subtitleSlideAnim.setValue(20);

      Animated.parallel([
        Animated.timing(subtitleFadeAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(subtitleSlideAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [displayedText.length, fullText.length, subtitleFadeAnim, subtitleSlideAnim]);

  // Animacja content przy zmianie ekranu
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    contentScaleAnim.setValue(0.9);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(contentScaleAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  }, [currentStep, fadeAnim, slideAnim, contentScaleAnim]);

  // Animacja wejścia/wyjścia back button
  useEffect(() => {
    if (currentStep > 0) {
      // Przycisk się pojawia
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
      // Przycisk się chowa
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

  return (
    <View style={styles.rootContainer}>
      <ScrollView
        ref={scrollViewRef}
        pagingEnabled
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        style={styles.root}
      >
        {/* Screen 1: Welcome */}
        <View style={styles.screen}>
          <Animated.View style={[styles.screenContent, {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: contentScaleAnim }
            ],
          }]}>
            <Text style={styles.title}>
              {displayedText}
              <Text style={!showCursor && { color: 'transparent' }}>|</Text>
            </Text>
            <Animated.View style={[{
              opacity: subtitleFadeAnim,
              transform: [{ translateY: subtitleSlideAnim }]
            }]}>
              <CustomText style={styles.subtitle} weight='Regular'>
                Odpowiedz nam na parę pytań żebyśmy mogli rozpocząć naukę.
              </CustomText>
            </Animated.View>

          </Animated.View>
        </View>

        {/* Screen 2: Main Language */}
        <View style={styles.screen}>
          <Animated.View style={[styles.screenContent, {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: contentScaleAnim }
            ],
          }]}>
            <LanguagePicker
              languageType={LanguageTypes.MAIN}
              onLanguagePicked={handleMainLangPick}
              style={styles.languagePicker}
            />
          </Animated.View>
        </View>

        {/* Screen 3: Translation Language */}
        <View style={styles.screen}>
          <Animated.View style={[styles.screenContent, {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: contentScaleAnim }
            ],
          }]}>
            <LanguagePicker
              languageType={LanguageTypes.TRANSLATION}
              onLanguagePicked={handleTranslationLangPick}
              style={styles.languagePicker}
            />
          </Animated.View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        {currentStep > 0 && (
          <Animated.View style={[
            {
              transform: [
                { translateY: backSlideAnim }
              ],
              opacity: backOpacityAnim,
            }
          ]}>
            <ActionButton
              label={t('back')}
              primary={false}
              style={styles.backButton}
              icon={'arrow-back-outline'}
              onPress={handleBackPress}
            />
          </Animated.View>
        )}
        <ActionButton
          label={t('continue')}
          primary={true}
          style={styles.button}
          icon={'arrow-forward-outline'}
          onPress={handleContinuePress}
        />
      </View>

      <View style={styles.lottieWrapper}>
        <LottieView
          ref={confettiRef}
          source={require('../../../assets/confetti.json')}
          autoPlay={false}
          loop={false}
          style={styles.lottie}
        />
      </View>
    </View>
  );
}

const getStyles = (colors: any, insets: any) => StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  languagePicker: {
    flex: 1, width: '100%'
  },
  screen: {
    flex: 1,
    height: screenHeight,
    paddingTop: insets.top + MARGIN_VERTICAL,
    paddingBottom: insets.bottom + MARGIN_VERTICAL,
  },
  screenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: colors.primary,
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    marginHorizontal: MARGIN_HORIZONTAL * 2,
    color: colors.primary600,
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    paddingHorizontal: MARGIN_HORIZONTAL,
    paddingBottom: insets.bottom + MARGIN_VERTICAL,
  },
  backButton: {
    margin: 0,
    marginBottom: MARGIN_VERTICAL / 2,
  },
  button: {
    margin: 0,
  },
  lottieWrapper: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    position: 'absolute',
    pointerEvents: 'none',
  },
  lottie: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
});

export default OnboardingScreen;