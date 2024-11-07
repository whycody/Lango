import React, { FC, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import CustomText from "./CustomText";
import * as Haptics from 'expo-haptics';
import ESFlag from '../assets/flags/es.svg';
import PLFlag from '../assets/flags/pl.svg';
import FlipCard from 'react-native-flip-card'
import { Ionicons } from "@expo/vector-icons";
import { LANGO, useWords } from "../store/WordsContext";
import { FlashcardContent } from "../store/FlashcardsContext";

interface FlashcardProps {
  onFlashcardPress?: () => void;
  flashcardContent?: FlashcardContent,
  style?: any;
}

const flagMap: Record<string, any> = {
  es: ESFlag,
  pl: PLFlag,
};

const FlagComponent = ({ languageCode }) => {
  const Flag = flagMap[languageCode];
  return Flag ? <Flag width={22} height={22} style={{ marginRight: 6 }}/> : null;
};

const Flashcard: FC<FlashcardProps> = ({ onFlashcardPress, flashcardContent, style }) => {
  const [flippable, setFlippable] = useState(true);
  const [newFlashcardIsReady, setNewFlashcardIsReady] = useState(false);
  const [readyToFlip, setReadyToFlip] = useState(false);
  const [flip, setFlip] = useState(false);
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const { t } = useTranslation();
  const wordsContext = useWords();

  const firstLanguage = 'es';
  const secondLanguage = 'pl';

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

  const handleFlip = () => {
    if (!flippable) return;
    setFlippable(false);
    setNewFlashcardIsReady(false);
    const addWord = wordsContext.addWord(flashcardContent.word, flashcardContent.translation, LANGO);
    if (!addWord) setBackText(t('wordNotAdded'));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    onFlashcardPress();
    setTimeout(() => {setReadyToFlip(true); }, 1000);
  }

  return (
    <View pointerEvents={flippable ? 'auto' : 'none'} style={{ flex: 1 }}>
      <FlipCard flip={flip} onFlipStart={handleFlip}>
        <View style={[styles.root, style]}>
          <View style={styles.flagsContainer}>
            <FlagComponent languageCode={firstLanguage}/>
            <FlagComponent languageCode={secondLanguage}/>
          </View>
          <CustomText weight={"SemiBold"} style={styles.word} numberOfLines={1}>{flashcardContent?.word}</CustomText>
          <CustomText style={styles.translation} numberOfLines={1}>{flashcardContent?.translation}</CustomText>
          <View style={styles.plusContainer}>
            <Ionicons name={'add'} size={16} color={colors.primary}/>
          </View>
        </View>
        <View style={[styles.root, style, { justifyContent: 'center' }]}>
          <CustomText weight={"SemiBold"} style={styles.successText}>{backText}</CustomText>
        </View>
      </FlipCard>
    </View>
  );
};

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
