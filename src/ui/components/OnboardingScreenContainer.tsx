import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MARGIN_VERTICAL } from "../../constants/margins";

const screenHeight = Dimensions.get('window').height;

interface OnboardingScreenContainerProps {
  children: React.ReactNode;
  currentStep: number;
}

const OnboardingScreenContainer: React.FC<OnboardingScreenContainerProps> = ({ children, currentStep }) => {
  const insets = useSafeAreaInsets();
  const styles = getStyles(insets);

  const fadeAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const contentScaleAnim = useRef(new Animated.Value(0.8)).current;

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

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.screenContent, {
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
          { scale: contentScaleAnim }
        ],
      }]}>
        {children}
      </Animated.View>
    </View>
  );
};

const getStyles = (insets: any) => StyleSheet.create({
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
});

export default OnboardingScreenContainer;

