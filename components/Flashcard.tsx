import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomText from "./CustomText";
import * as Haptics from 'expo-haptics';
import FlipCard from 'react-native-flip-card'
import { Foundation } from "@expo/vector-icons";
import { LANGO, useWords } from "../store/WordsContext";
import { FlashcardContent } from "../store/FlashcardsContext";
import SquareFlag from "./SquareFlag";
import { useLanguage } from "../hooks/useLanguage";
import { LinearGradient } from "expo-linear-gradient";

interface FlashcardProps {
  onFlashcardPress?: () => void;
  flashcardContent?: FlashcardContent,
  style?: any;
}

const Flashcard = forwardRef(({ onFlashcardPress, flashcardContent, style }: FlashcardProps, ref) => {
  const [flippable, setFlippable] = useState(true);
  const [newFlashcardIsReady, setNewFlashcardIsReady] = useState(false);
  const [readyToFlip, setReadyToFlip] = useState(false);
  const [flip, setFlip] = useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const wordsContext = useWords();
  const languageContext = useLanguage();

  useImperativeHandle(ref, () => ({
    flipWithoutAdd: () => handleFlip(false),
  }));

  const getRandomMessage = () => {
    const messages = [
      t('wordAdded1'),
      t('wordAdded2'),
      t('wordAdded3'),
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };

  const [backText, setBackText] = useState(getRandomMessage());

  useEffect(() => {
    if (!flashcardContent) return;
    setNewFlashcardIsReady(true);
  }, [flashcardContent]);

  useEffect(() => {
    if (!newFlashcardIsReady || !readyToFlip) return;
    setNewFlashcardIsReady(false);
    setReadyToFlip(false);
    setFlip((prevState) => !prevState);
    setTimeout(() => {
      setBackText(getRandomMessage());
      setFlippable(true);
    }, 100);
  }, [setNewFlashcardIsReady, newFlashcardIsReady, readyToFlip]);

  const handleFlip = (add: boolean = true) => {
    if (!flippable) return;
    if (!add) setFlip((prev) => !prev);
    setFlippable(false);
    setNewFlashcardIsReady(false);
    if (add) {
      const addWord = wordsContext.addWord(flashcardContent.word, flashcardContent.translation, LANGO);
      if (!addWord) setBackText(t('wordNotAdded'));
    } else setBackText(t('change_flashcard'));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    setTimeout(() => onFlashcardPress(), 150);
    setTimeout(() => setReadyToFlip(true), 1000);
  }

  return (
    <View pointerEvents={flippable ? 'auto' : 'none'} style={{ flex: 1 }}>
      <FlipCard flip={flip} onFlipStart={() => handleFlip(true)}>
        <LinearGradient
          colors={[colors.cardAccent, colors.cardAccent600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.root, style]}
        >
          <View style={styles.flagsContainer}>
            <SquareFlag languageCode={languageContext.mainLangCode} style={{ marginRight: 6 }}/>
            <SquareFlag languageCode={languageContext.studyingLangCode}/>
          </View>
          <CustomText weight={"SemiBold"} style={styles.word} numberOfLines={1}>{flashcardContent?.word}</CustomText>
          <CustomText style={styles.translation} numberOfLines={1}>{flashcardContent?.translation}</CustomText>
          <View style={styles.plusContainer}>
            <Foundation name={'plus'} size={12} color={colors.primary}/>
          </View>
        </LinearGradient>
        <LinearGradient
          colors={[colors.cardAccent, colors.cardAccent600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.root, style, { justifyContent: 'center' }]}
        >
          <CustomText weight={"SemiBold"} style={styles.successText}>{backText}</CustomText>
        </LinearGradient>
      </FlipCard>
    </View>
  );
});

const getStyles = (colors: any) => StyleSheet.create({
  root: {
    backgroundColor: colors.cardAccent,
    padding: 12,
    height: 86,
  },
  flagsContainer: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  flag: {
    width: 30,
    height: 30,
    marginRight: 4,
  },
  word: {
    fontSize: 14,
    color: colors.primary300
  },
  translation: {
    fontSize: 12,
    color: colors.primary300,
    opacity: 0.8,
  },
  successText: {
    fontSize: 14,
    color: colors.primary300,
    textAlign: 'center'
  },
  plusContainer: {
    backgroundColor: colors.card,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 22,
    height: 22,
    right: 12,
    top: 12
  }
});

export default Flashcard;
