import React, { FC, useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useAuth } from "../../api/auth/AuthProvider";
import CustomText from "../components/CustomText";
import LottieView from "lottie-react-native";
import { MARGIN_HORIZONTAL, } from "../../constants/margins";
import { useTranslation } from "react-i18next";

interface WelcomeScreenProps {
  onAnimationEnd?: () => void;
}

const WelcomeScreen: FC<WelcomeScreenProps> = ({ onAnimationEnd }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const styles = getStyles(colors);
  const { t } = useTranslation();

  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const subtitleFadeAnim = useRef(new Animated.Value(0)).current;
  const subtitleSlideAnim = useRef(new Animated.Value(20)).current;
  const titleMarginAnim = useRef(new Animated.Value(0)).current;
  const confettiRef = useRef<LottieView>();

  const fullText = t('welcome_onboarding', { name: user.name.split(' ')[0] });

  const showConfetti = () => {
    setTimeout(() => {
      confettiRef.current?.play(0);
    }, 300);
  }

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
          onAnimationEnd?.();
          setDisplayedText((text) => text + '\uD83C\uDF89')
          clearInterval(typeInterval);
          showConfetti();
        }
      }, 110);
    };

    const delayTimeout = setTimeout(startTyping, 500);

    return () => {
      clearTimeout(delayTimeout);
      clearInterval(typeInterval);
    };
  }, [fullText]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (displayedText.length === fullText.length) {
      const animationDuration = 500;
      subtitleFadeAnim.setValue(0);
      subtitleSlideAnim.setValue(20);

      Animated.parallel([
        Animated.timing(subtitleFadeAnim, {
          toValue: 1,
          duration: animationDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(subtitleSlideAnim, {
          toValue: 0,
          duration: animationDuration,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [displayedText.length, fullText.length, subtitleFadeAnim, subtitleSlideAnim]);

  return (
    <View style={styles.root}>
      <Text style={[styles.title, { marginBottom: titleMarginAnim }]}>
        {displayedText}
        <Text style={!showCursor && { color: 'transparent' }}>|</Text>
      </Text>
      <Animated.View style={[{
        opacity: subtitleFadeAnim,
        transform: [{ translateY: subtitleSlideAnim }]
      }]}>
        <CustomText style={styles.subtitle} weight='Regular'>
          {t('welcome_onboarding_desc')}
        </CustomText>
      </Animated.View>

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
};

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    paddingBottom: 20,
    justifyContent: 'center',
    height: '100%',
    backgroundColor: colors.background,
  },
  title: {
    color: colors.primary300,
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  subtitle: {
    color: colors.primary600,
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: MARGIN_HORIZONTAL * 3
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

export default WelcomeScreen;

