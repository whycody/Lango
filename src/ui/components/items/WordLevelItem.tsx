import { FC, useRef, useState } from "react";
import { Pressable, StyleSheet, View, Animated, Easing } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomText from "../CustomText";
import { MARGIN_HORIZONTAL } from "../../../constants/margins";
import { SessionLength } from "../../../store/UserPreferencesContext";
import { LinearGradient } from "expo-linear-gradient";

const RECT_HEIGHT = 13;

interface SessionLengthItemProps {
  level: SessionLength;
  active: boolean;
  onPress?: () => void;
  style?: any;
}

const WordLevelItem: FC<SessionLengthItemProps> = ({ level, active, onPress, style }) => {
  const { colors } = useTheme();
  const styles = getStyles(colors, level);
  const { t } = useTranslation();

  const [gradientColors, setGradientColors] = useState<[string, string, ...string[]]>([colors.background, colors.card]);

  const rectangles = [
    {
      scale: useRef(new Animated.Value(1)).current,
      spread: useRef(new Animated.Value(0)).current,
      jump: useRef(new Animated.Value(0)).current
    },
    {
      scale: useRef(new Animated.Value(1)).current,
      spread: useRef(new Animated.Value(0)).current,
      jump: useRef(new Animated.Value(0)).current
    },
    { scale: null, spread: null, jump: null },
  ];

  const handlePressIn = () => {
    const color = level > SessionLength.MEDIUM ? colors.green300 : level > SessionLength.SHORT ? colors.yellow300 : colors.red300;
    setGradientColors([color, colors.card]);

    Animated.parallel([
      Animated.spring(rectangles[0].scale!, { toValue: 1.1, useNativeDriver: true }),
      Animated.spring(rectangles[1].scale!, { toValue: 1.05, useNativeDriver: true }),
      Animated.spring(rectangles[0].spread!, { toValue: -2, useNativeDriver: true }),
      Animated.spring(rectangles[1].spread!, { toValue: -0.5, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    setGradientColors([colors.background, colors.card]);

    Animated.parallel([
      Animated.spring(rectangles[0].scale!, { toValue: 1, useNativeDriver: true }),
      Animated.spring(rectangles[1].scale!, { toValue: 1, useNativeDriver: true }),
      Animated.spring(rectangles[0].spread!, { toValue: 0, useNativeDriver: true }),
      Animated.spring(rectangles[1].spread!, { toValue: 0, useNativeDriver: true }),
    ]).start();
  };

  const handlePress = () => {
    const jump = (anim: Animated.Value, height: number) =>
      Animated.sequence([
        Animated.timing(anim, {
          toValue: -height,
          duration: 160,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.spring(anim, { toValue: 0, speed: 18, bounciness: 4, useNativeDriver: true }),
      ]);

    Animated.parallel([
      jump(rectangles[0].jump!, 2),
      jump(rectangles[1].jump!, 1),
    ]).start();

    onPress?.();
  };

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={style}
    >
      <Pressable
        style={styles.root}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={active ? handlePress : undefined}
      >
        <View style={styles.rectanglesContainer}>
          {rectangles.map((r, i) =>
            r.scale ? (
              <Animated.View
                key={i}
                style={[
                  styles.rectangle,
                  {
                    opacity:
                      i === 0
                        ? level > SessionLength.MEDIUM ? 1 : 0.2
                        : i === 1
                          ? level > SessionLength.SHORT ? 1 : 0.2
                          : 1,
                    transform: [
                      { translateY: Animated.add(r.spread!, r.jump!) },
                      { scaleY: r.scale },
                    ],
                  },
                ]}
              />
            ) : (
              <View key={i} style={[styles.rectangle, { opacity: 1 }]}/>
            )
          )}
        </View>

        <CustomText weight="Bold" style={styles.title}>
          {t(
            level === SessionLength.SHORT
              ? "poorly"
              : level === SessionLength.MEDIUM
                ? "moderately"
                : "good"
          )}
        </CustomText>
      </Pressable>
    </LinearGradient>
  );
};

const getStyles = (colors: any, level: number) =>
  StyleSheet.create({
    root: {
      paddingTop: MARGIN_HORIZONTAL,
      paddingBottom: MARGIN_HORIZONTAL - 3,
    },
    rectanglesContainer: {
      alignItems: "center",
    },
    rectangle: {
      width: 40,
      height: RECT_HEIGHT,
      marginTop: 2,
      backgroundColor:
        level > SessionLength.MEDIUM
          ? colors.green600
          : level > SessionLength.SHORT
            ? colors.yellow600
            : colors.red600,
    },
    title: {
      fontSize: 11,
      marginTop: 8,
      textAlign: "center",
      color: colors.primary300,
    },
  });

export default WordLevelItem;