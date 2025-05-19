import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, SafeAreaView, StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { ProgressBar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import CustomText from '../components/CustomText';
import WordLevelItem from '../components/items/WordLevelItem';
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
import LeaveSessionBottomSheet from "../sheets/LeaveSessionBottomSheet";
import * as Speech from 'expo-speech';
import { FLASHCARD_SIDE, SESSION_MODE } from "../store/UserPreferencesContext";
import { useSessions } from "../store/SessionsContext";
import { useEvaluations } from "../store/EvaluationsContext";

type RouteParams = {
  length: 1 | 2 | 3;
  mode: SESSION_MODE;
  flashcardSide: FLASHCARD_SIDE
};

const SessionScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const confettiRef = useRef<LottieView>();

  const route = useRoute();
  const params = route.params as RouteParams;
  const length = params?.length || 1;
  const mode = params?.mode || SESSION_MODE.STUDY;
  const flashcardSide = params?.flashcardSide || FLASHCARD_SIDE.WORD;
  const wordsContext = useWords();
  const sessionsContext = useSessions();
  const evaluationsContext = useEvaluations();

  const pagerRef = useRef(null);
  const [cards, setCards] = useState(wordsContext.getWordSet(length * 10, mode));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
  const leaveSessionBottomSheetRef = useRef<BottomSheetModal>(null);
  const finishSessionBottomSheetRef = useRef<BottomSheetModal>(null);
  const handleFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);

  const statsContext = useStatistics();
  const [editId, setEditId] = useState<string | null>(null);
  const [scaleValues] = useState(cards.map(() => new Animated.Value(1)));
  const [flashcardUpdates, setFlashcardUpdates] = useState<FlashcardUpdate[]>([]);
  const [numberOfSession, setNumberOfSession] = useState(0);
  const [flipped, setFlipped] = useState(flashcardSide == FLASHCARD_SIDE.TRANSLATION);
  const [flippedCards, setFlippedCards] = useState(Array(length * 10).fill(false));
  const [lastPressTime, setLastPressTime] = useState<number>(0);

  const navigation = useNavigation();

  useEffect(() => {
    const handleBackPress = () => {
      if (bottomSheetIsShown) hideBottomSheets();
      else leaveSessionBottomSheetRef.current?.present();
      return true;
    };

    const subscription = BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    return () => subscription.remove();
  }, [bottomSheetIsShown]);

  const hideBottomSheets = () => {
    handleFlashcardBottomSheetRef.current?.dismiss();
    leaveSessionBottomSheetRef.current?.dismiss();
    finishSessionBottomSheetRef.current?.dismiss();
  }

  const decrementCurrentIndex = () => {
    setCurrentIndex((prev) => prev == 0 ? prev : prev - 1)
  };

  const incrementCurrentIndex = () => {
    if (currentIndex < cards.length) setCurrentIndex((prev) => prev + 1);
  };

  const handleEditPress = (id: string) => {
    setEditId(id);
    handleFlashcardBottomSheetRef.current.present();
  }

  const handleFlipPress = (index: number, isFlipped: boolean) => {
    setFlippedCards(prev => {
      const updated = [...prev];
      updated[index] = isFlipped;
      return updated;
    });
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
        onFlipStart={(isFlipped: boolean) => handleFlipPress(wordIndex, !isFlipped)}
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

  useEffect(() => {
    const word = cards[currentIndex];
    if (!word) return;
    if ((flipped && !flippedCards[currentIndex]) || (!flipped && flippedCards[currentIndex])) {
      Speech.stop().then(() => {
        Speech.speak(word?.text, { language: word.firstLang });
      });
    }
  }, [flipped, currentIndex, flippedCards]);

  const handleLevelPress = (level: 1 | 2 | 3) => {
    const now = Date.now();
    if (now - lastPressTime < 300) return;
    setLastPressTime(now);

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
  };

  useEffect(() => {
    if (flashcardUpdates.length === 0) return;
    (flashcardUpdates.length === cards.length) ? finishSession() : incrementCurrentIndex();
  }, [flashcardUpdates]);

  const finishSession = () => {
    incrementCurrentIndex();
    confettiRef.current?.play(0);
    const avgGrade = flashcardUpdates.reduce((sum, u) => sum + u.grade, 0) / flashcardUpdates.length;
    const session = sessionsContext.addSession(mode, avgGrade, length * 10);
    evaluationsContext.addEvaluations(flashcardUpdates.map((update: FlashcardUpdate) => ({
      wordId: update.flashcardId,
      sessionId: session.id,
      grade: update.grade
    })));
    statsContext.addTodayDayToStudyDaysList();
    statsContext.increaseNumberOfSessions();
    finishSessionBottomSheetRef.current?.present();
    wordsContext.updateFlashcards(flashcardUpdates);
  }

  useEffect(() => {
    setProgress(currentIndex);
    pagerRef.current.setPage(currentIndex);
  }, [currentIndex]);

  const endSession = () => {
    if (flashcardUpdates.length !== cards.length) return;
    finishSessionBottomSheetRef.current?.dismiss();
    navigation.navigate('Tabs' as never);
  }

  const startNewSession = () => {
    setFlippedCards(Array(length * 10).fill(false));
    setNumberOfSession((prev) => prev + 1);
    setFlashcardUpdates([]);
    setCards(wordsContext.getWordSet(length * 10, mode).sort(() => Math.random() - 0.5));
    setTimeout(() => {
      setCurrentIndex(0);
      finishSessionBottomSheetRef.current?.dismiss();
    }, 200);
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
      <LeaveSessionBottomSheet
        ref={leaveSessionBottomSheetRef}
        leaveSession={handleSessionExit}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <HandleFlashcardBottomSheet
        ref={handleFlashcardBottomSheetRef}
        onWordEdit={handleWordEdit}
        flashcardId={editId}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <FinishSessionBottomSheet
        ref={finishSessionBottomSheetRef}
        flashcardUpdates={flashcardUpdates}
        endSession={endSession}
        startNewSession={startNewSession}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <View style={{ backgroundColor: colors.card, paddingBottom: 20 }}>
        <SessionHeader
          length={length}
          cardsSetLength={cards.length}
          progress={progress}
          onSessionExit={() => leaveSessionBottomSheetRef.current?.present()}
          onFlipCards={handleFlipCards}
        />
        <View style={{ marginHorizontal: MARGIN_HORIZONTAL }}>
          <ProgressBar
            animatedValue={progress ? progress / cards.length : 0.000001}
            color={colors.primary}
            style={styles.progressBar}
          />
        </View>
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
          <View key={word.id + numberOfSession} style={styles.pagerViewItem}>
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
            active={currentIndex < cards.length}
            style={{ flex: 1, marginRight: 6 }}
            onPress={() => handleLevelPress(1)}
          />
          <WordLevelItem
            level={2}
            active={currentIndex < cards.length}
            style={{ flex: 1, marginLeft: 3, marginRight: 3 }}
            onPress={() => handleLevelPress(2)}
          />
          <WordLevelItem
            level={3}
            active={currentIndex < cards.length}
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
      backgroundColor: colors.cardAccent,
      height: 5,
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