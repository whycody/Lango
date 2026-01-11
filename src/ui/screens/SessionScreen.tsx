import React, { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, StyleSheet, View } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useRoute, useTheme } from '@react-navigation/native';
import { ProgressBar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import CustomText from '../components/CustomText';
import WordLevelItem from '../components/items/WordLevelItem';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import FlipCard from "react-native-flip-card";
import Card from "../components/Card";
import * as Haptics from "expo-haptics";
import LottieView from "lottie-react-native";
import FinishSessionBottomSheet from "../sheets/FinishSessionBottomSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import SessionHeader from "../components/session/SessionHeader";
import HandleFlashcardBottomSheet from "../sheets/HandleFlashcardBottomSheet";
import LeaveSessionBottomSheet from "../sheets/LeaveSessionBottomSheet";
import * as Speech from 'expo-speech';
import { FlashcardSide, SessionLength, useUserPreferences } from "../../store/UserPreferencesContext";
import { useSessions } from "../../store/SessionsContext";
import { useEvaluations } from "../../store/EvaluationsContext";
import { EvaluationGrade, SessionMode } from "../../types";
import { useWordSet } from "../../hooks/useWordSet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SessionSettingsBottomSheet from "../sheets/SessionSettingsBottomSheet";
import { WordUpdate } from "../../types/utils/WordUpdate";
import { useHaptics } from "../../hooks/useHaptics";
import { ScreenName } from "../../navigation/AppStack";

export type SessionScreenParams = {
  length: SessionLength;
  mode: SessionMode;
  flashcardSide: FlashcardSide
};

const SessionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const confettiRef = useRef<LottieView>();

  const route = useRoute();
  const params = route.params as SessionScreenParams;
  const length = params?.length || 1;
  const mode = params?.mode || SessionMode.STUDY;
  const flashcardSide = params?.flashcardSide || FlashcardSide.WORD;
  const sessionsContext = useSessions();
  const evaluationsContext = useEvaluations();

  const pagerRef = useRef(null);
  const wordSet = useWordSet(length * 10, mode);

  const [model, setModel] = useState(wordSet.model);
  const [cards, setCards] = useState(wordSet.words);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
  const leaveSessionBottomSheetRef = useRef<BottomSheetModal>(null);
  const finishSessionBottomSheetRef = useRef<BottomSheetModal>(null);
  const handleFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);
  const sessionSettingsBottomSheetRef = useRef<BottomSheetModal>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [scaleValues] = useState(cards.map(() => new Animated.Value(1)));
  const [wordsUpdates, setWordsUpdates] = useState<WordUpdate[]>([]);
  const [numberOfSession, setNumberOfSession] = useState(0);
  const [flippedCards, setFlippedCards] = useState(Array(length * 10).fill(false));
  const [lastPressTime, setLastPressTime] = useState<number>(0);

  const userPreferences = useUserPreferences();
  const { triggerHaptics } = useHaptics();
  const [flipped, setFlipped] = useState(flashcardSide === FlashcardSide.TRANSLATION);

  const insets = useSafeAreaInsets();
  const isInitial = useRef(true)

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false
      return
    }

    setFlipped(userPreferences.flashcardSide === FlashcardSide.TRANSLATION);
  }, [userPreferences.flashcardSide]);

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
    sessionSettingsBottomSheetRef.current?.dismiss();
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
    if (((flipped && !flippedCards[currentIndex]) || (!flipped && flippedCards[currentIndex])) && userPreferences.sessionSpeechSynthesizer) {
      Speech.stop().then(() => {
        Speech.speak(word?.text, { language: word.mainLang });
      });
    }
  }, [flipped, currentIndex, flippedCards, userPreferences.sessionSpeechSynthesizer]);

  const handleLevelPress = (level: EvaluationGrade) => {
    const now = Date.now();
    if (now - lastPressTime < 300) return;
    setLastPressTime(now);

    triggerHaptics(Haptics.ImpactFeedbackStyle.Rigid);

    const currentCardId: string = cards[currentIndex].id;

    setWordsUpdates(prevUpdates => {
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
    if (wordsUpdates.length === 0) return;
    (wordsUpdates.length === cards.length) ? finishSession() : incrementCurrentIndex();
  }, [wordsUpdates]);

  const finishSession = () => {
    incrementCurrentIndex();
    confettiRef.current?.play(0);
    saveProgress(true);
    triggerHaptics(Haptics.ImpactFeedbackStyle.Heavy);
    finishSessionBottomSheetRef.current?.present();
  }

  useEffect(() => {
    setProgress(currentIndex);
    pagerRef.current.setPage(currentIndex);
  }, [currentIndex]);

  const endSession = () => {
    if (wordsUpdates.length !== cards.length) return;
    finishSessionBottomSheetRef.current?.dismiss();
    navigation.navigate(ScreenName.Tabs);
  }

  const startNewSession = () => {
    setFlippedCards(Array(length * 10).fill(false));
    setNumberOfSession((prev) => prev + 1);
    setWordsUpdates([]);
    setModel(wordSet.model);
    setCards(wordSet.words);
    setTimeout(() => {
      setCurrentIndex(0);
      finishSessionBottomSheetRef.current?.dismiss();
    }, 200);
  }

  const handleSessionExit = () => {
    saveProgress(false);
    navigation.navigate(ScreenName.Tabs);
  }

  const saveProgress = (finished: boolean) => {
    if (wordsUpdates.length == 0) return;
    const avgGrade = wordsUpdates.reduce((sum, u) => sum + u.grade, 0) / wordsUpdates.length;
    const { mainLang, translationLang } = wordSet.words[0];
    const session = sessionsContext.addSession(mode, model, avgGrade, length * 10, mainLang, translationLang, finished);
    evaluationsContext.addEvaluations(wordsUpdates.map((update: WordUpdate) => ({
      wordId: update.flashcardId,
      sessionId: session.id,
      grade: update.grade
    })));
  }

  const handleWordEdit = (id: string, word: string, translation: string) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id ? { ...card, text: word, translation: translation } : card
      )
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: colors.card }}/>
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
        flashcardUpdates={wordsUpdates}
        endSession={endSession}
        startNewSession={startNewSession}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <SessionSettingsBottomSheet
        ref={sessionSettingsBottomSheetRef}
        onSettingsSave={() => sessionSettingsBottomSheetRef.current.dismiss()}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <View style={{ backgroundColor: colors.card, paddingBottom: 20 }}>
        <SessionHeader
          length={length}
          cardsSetLength={cards.length}
          progress={progress}
          onSessionExit={() => leaveSessionBottomSheetRef.current?.present()}
          onSettingsPressed={() => sessionSettingsBottomSheetRef.current?.present()}
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
        <View style={styles.textContainer}>
          <CustomText weight="SemiBold" style={styles.headerText}>
            {t('howWell')}
          </CustomText>
          <CustomText weight="Regular" style={styles.descriptionText}>
            {t('select_level')}
          </CustomText>
        </View>
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
    textAlign: 'center'
  },
  descriptionText: {
    textAlign: 'center',
    color: colors.primary600,
    opacity: 0.8,
    fontSize: 12,
  },
  textContainer: {
    marginVertical: 18,
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

export default SessionScreen;