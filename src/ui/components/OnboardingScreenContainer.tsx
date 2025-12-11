import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated, Easing } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);

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
    ]).start();
  }, [currentStep, fadeAnim, slideAnim]);

  return (
    <View style={styles.screen}>
      <Animated.View style={[styles.screenContent, {
        opacity: fadeAnim,
        transform: [
          { translateY: slideAnim },
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
    height: screenHeight + insets.top + insets.bottom,
  },
  screenContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OnboardingScreenContainer;

