import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, StyleSheet, View, Animated } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { ProgressBar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import CustomText from '../components/CustomText';
import WordLevelItem from '../components/WordLevelItem';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../src/constants';
import { FlashcardUpdate, useWords } from '../store/WordsContext';
import FlipCard from "react-native-flip-card";
import Card from "../components/Card";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import FinishSessionBottomSheet from "../sheets/FinishSessionBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import SessionHeader from "../components/session/SessionHeader";
import HandleFlashcardBottomSheet from "../sheets/HandleFlashcardBottomSheet";
import { useStatistics } from "../hooks/useStatistics";

type RouteParams = {
  length: 1 | 2 | 3;
};

const SessionScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const confettiRef = useRef<LottieView>();

  const route = useRoute();
  const length = (route.params as RouteParams)?.length || 1;
  const wordsContext = useWords();

  const pagerRef = useRef(null);
  const [cards, setCards] = useState(wordsContext.getWordSet(length * 10));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const finishSessionBottomSheetRef = useRef<BottomSheetModal>(null);
  const handleFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);

  const statsContext = useStatistics();
  const [editId, setEditId] = useState<string | null>(null);
  const [scaleValues] = useState(cards.map(() => new Animated.Value(1)));
  const [flashcardUpdates, setFlashcardUpdates] = useState<FlashcardUpdate[]>([]);
  const [flipped, setFlipped] = useState(false);

  const navigation = useNavigation();

  const decrementCurrentIndex = () => {
    setCurrentIndex((prev) => prev == 0 ? prev : prev - 1)
  };

  const incrementCurrentIndex = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const handleEditPress = (id: string) => {
    setEditId(id);
    handleFlashcardBottomSheetRef.current.present();
  }

  const renderCard = (word: any, wordIndex: number) => {
    const isActive = currentIndex === wordIndex;

    Animated.spring(scaleValues[wordIndex], {
      toValue: isActive ? 1 : 0.8,
      friction: 6,
      useNativeDriver: true,
    }).start();

    return (
      <FlipCard
        style={styles.card}
        flipHorizontal={true}
        flipVertical={false}
        alignHeight={true}
        alignWidth={true}
        friction={6}
      >
        <Animated.View style={[styles.cardContent, { transform: [{ scale: scaleValues[wordIndex] }] }]}>
          <Card
            wordIndex={wordIndex}
            text={flipped ? word?.text : word?.translation}
            onBackPress={decrementCurrentIndex}
            onEditPress={() => handleEditPress(word.id)}
          />
        </Animated.View>
        <Animated.View style={[styles.cardContent, { transform: [{ scale: scaleValues[wordIndex] }] }]}>
          <Card
            wordIndex={wordIndex}
            text={flipped ? word?.translation : word?.text}
            onBackPress={decrementCurrentIndex}
            onEditPress={() => handleEditPress(word.id)}
          />
        </Animated.View>
      </FlipCard>
    );
  };

  const handleLevelPress = (level: 1 | 2 | 3) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);

    const currentCardId: string = cards[currentIndex].id;

    setFlashcardUpdates(prevUpdates => {
      const existingUpdateIndex = prevUpdates.findIndex(update => update.flashcardId === currentCardId);

      if (existingUpdateIndex >= 0) {
        const updatedUpdates = [...prevUpdates];
        updatedUpdates[existingUpdateIndex].grade = level;
        return updatedUpdates;
      } else {
        return [...prevUpdates, { flashcardId: currentCardId, grade: level }];
      }
    });

    (currentIndex === cards.length - 1) ? finishSession() : incrementCurrentIndex();
  };

  const finishSession = () => {
    incrementCurrentIndex();
    confettiRef.current?.play(0);
    statsContext.increaseNumberOfDays();
    statsContext.increaseNumberOfSessions();
    finishSessionBottomSheetRef.current.present();
    wordsContext.updateFlashcards(flashcardUpdates);
  }

  useEffect(() => {
    setProgress(currentIndex);
    pagerRef.current.setPage(currentIndex);
  }, [currentIndex]);

  const endSession = () => {
    finishSessionBottomSheetRef.current.dismiss();
    navigation.navigate('Tabs' as never);
  }

  const startNewSession = () => {
    setCards(wordsContext.getWordSet(length * 10));
    finishSessionBottomSheetRef.current.dismiss();
    setCurrentIndex(0);
    setFlashcardUpdates([]);
  }

  const handleSessionExit = () => {
    wordsContext.updateFlashcards(flashcardUpdates);
    navigation.navigate('Tabs' as never);
  }

  const handleFlipCards = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
    setFlipped((prev) => !prev);
  }

  const handleWordEdit = (id: string, word: string, translation: string) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, text: word, translation: translation } : card
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <HandleFlashcardBottomSheet
        ref={handleFlashcardBottomSheetRef}
        onWordEdit={handleWordEdit}
        flashcardId={editId}
      />
      <FinishSessionBottomSheet
        ref={finishSessionBottomSheetRef}
        flashcardUpdates={flashcardUpdates}
        endSession={endSession}
        startNewSession={startNewSession}
      />
      <SessionHeader
        length={length}
        cardsSetLength={cards.length}
        progress={progress}
        onSessionExit={handleSessionExit}
        onFlipCards={handleFlipCards}
      />
      <View style={{ marginHorizontal: MARGIN_HORIZONTAL }}>
        <ProgressBar
          progress={progress / cards.length}
          color={colors.primary}
          style={styles.progressBar}
        />
      </View>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        scrollEnabled={false}
        pageMargin={10}
        orientation="vertical"
      >
        {cards.map((word, index) => (
          <View key={word.id} style={styles.pagerViewItem}>
            {renderCard(word, index)}
          </View>
        ))}
      </PagerView>
      <View style={styles.bottomBarContainer}>
        <CustomText weight="SemiBold" style={styles.headerText}>
          {t('howWell')}
        </CustomText>
        <View style={{ flexDirection: 'row', marginHorizontal: MARGIN_HORIZONTAL, marginBottom: MARGIN_VERTICAL }}>
          <WordLevelItem
            level={1}
            selected={false}
            style={{ flex: 1, marginRight: 6 }}
            onPress={() => handleLevelPress(1)}
          />
          <WordLevelItem
            level={2}
            selected={false}
            style={{ flex: 1, marginLeft: 3, marginRight: 3 }}
            onPress={() => handleLevelPress(2)}
          />
          <WordLevelItem
            level={3}
            selected={false}
            style={{ flex: 1, marginLeft: 6 }}
            onPress={() => handleLevelPress(3)}
          />
        </View>
      </View>
      <View style={styles.lottieWrapper}>
        <LottieView
          ref={confettiRef}
          source={require('../assets/confetti.json')}
          autoPlay={false}
          loop={false}
          style={styles.lottie}
        />
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    pagerView: {
      flex: 1,
    },
    pagerViewItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    card: {
      height: '100%',
      marginVertical: MARGIN_VERTICAL,
      marginHorizontal: MARGIN_HORIZONTAL,
    },
    cardContent: {
      flex: 1,
      width: '100%',
    },
    progressBar: {
      marginTop: 12,
      backgroundColor: colors.card,
      height: 4,
    },
    bottomBarContainer: {
      backgroundColor: colors.card,
    },
    headerText: {
      color: colors.primary300,
      textAlign: 'center',
      marginTop: MARGIN_VERTICAL,
      marginBottom: 20,
    },
    lottieWrapper: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
      position: 'absolute',
      pointerEvents: 'none',
    },
    lottie: {
      width: '100%',
      height: 600,
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: 2,
      top: 0,
    },
  });
};

export default SessionScreen;