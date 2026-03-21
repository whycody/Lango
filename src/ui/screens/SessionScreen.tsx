import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, BackHandler, StyleSheet, View } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useRoute, useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import LottieView from "lottie-react-native";
import FlipCard from "react-native-flip-card";
import PagerView from "react-native-pager-view";
import { ProgressBar } from "react-native-paper";
import { EdgeInsets, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { AnalyticsEventName } from "../../constants/AnalyticsEventName";
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from "../../constants/margins";
import { useHaptics } from "../../hooks/useHaptics";
import { useWordSet } from "../../hooks/useWordSet";
import { ScreenName } from "../../navigation/AppStack";
import {
  FlashcardSide,
  SessionLength,
  WordSource,
  useEvaluations,
  useLanguage,
  useSessions,
  useSuggestions,
  useUserPreferences,
  useWords,
} from "../../store";
import { EvaluationGrade, SessionMode, SessionWord, Word } from "../../types";
import { WordUpdate } from "../../types/utils/WordUpdate";
import { trackEvent } from "../../utils/analytics";
import Card from "../components/Card";
import CustomText from "../components/CustomText";
import WordLevelItem from "../components/items/WordLevelItem";
import SessionHeader from "../components/session/SessionHeader";
import {
  FinishSessionBottomSheet,
  HandleFlashcardBottomSheet,
  HitFlashcardBottomSheet,
  LeaveSessionBottomSheet,
  SessionSettingsBottomSheet,
} from "../sheets";

export type SessionScreenParams = {
  length: SessionLength;
  mode: SessionMode;
  flashcardSide: FlashcardSide;
};

export const SessionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets);

  const route = useRoute();
  const params = route.params as SessionScreenParams;
  const length = params?.length || 1;
  const mode = params?.mode || SessionMode.STUDY;
  const flashcardSide = params?.flashcardSide || FlashcardSide.WORD;

  const sessionsContext = useSessions();
  const evaluationsContext = useEvaluations();
  const { addWords } = useWords();
  const { skipSuggestions } = useSuggestions();

  const userPreferences = useUserPreferences();
  const { mainLang, translationLang } = useLanguage();
  const { triggerHaptics } = useHaptics();

  const wordSet = useWordSet(length * 10, mode);

  const confettiRef = useRef<LottieView>();
  const pagerRef = useRef(null);
  const isInitial = useRef(true);

  const leaveSessionBottomSheetRef = useRef<BottomSheetModal>(null);
  const finishSessionBottomSheetRef = useRef<BottomSheetModal>(null);
  const handleFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);
  const sessionSettingsBottomSheetRef = useRef<BottomSheetModal>(null);
  const hitFlashcardBottomSheetRef = useRef<BottomSheetModal>(null);

  const [version, setVersion] = useState(wordSet.version);
  const [model, setModel] = useState(wordSet.model);
  const [cards, setCards] = useState(wordSet.sessionWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [flipped, setFlipped] = useState(
    flashcardSide === FlashcardSide.TRANSLATION,
  );

  const [bottomSheetIsShown, setBottomSheetIsShown] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [numberOfSession, setNumberOfSession] = useState(0);
  const [lastPressTime, setLastPressTime] = useState<number>(0);
  const [scaleValues] = useState(cards.map(() => new Animated.Value(1)));

  const [wordsUpdates, setWordsUpdates] = useState<WordUpdate[]>([]);
  const [skippedSuggestionsIds, setSkippedSuggestionsIds] = useState<string[]>(
    [],
  );
  const [flippedCards, setFlippedCards] = useState(
    Array(length * 10).fill(false),
  );

  useEffect(() => {
    if (isInitial.current) {
      isInitial.current = false;
      return;
    }

    setFlipped(userPreferences.flashcardSide === FlashcardSide.TRANSLATION);
  }, [userPreferences.flashcardSide]);

  useEffect(() => {
    const handleBackPress = () => {
      if (bottomSheetIsShown) {
        hideBottomSheets();
        return true;
      }

      trackEvent(AnalyticsEventName.LEAVE_SESSION_SHEET_OPEN);
      leaveSessionBottomSheetRef.current?.present();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );
    return () => subscription.remove();
  }, [bottomSheetIsShown]);

  const hideBottomSheets = () => {
    handleFlashcardBottomSheetRef.current?.dismiss();
    leaveSessionBottomSheetRef.current?.dismiss();
    finishSessionBottomSheetRef.current?.dismiss();
    sessionSettingsBottomSheetRef.current?.dismiss();
    hitFlashcardBottomSheetRef.current?.dismiss();
  };

  const decrementCurrentIndex = useCallback(() => {
    setCurrentIndex((prev) => (prev == 0 ? prev : prev - 1));
  }, []);

  const incrementCurrentIndex = useCallback(() => {
    if (currentIndex < cards.length) setCurrentIndex((prev) => prev + 1);
  }, [currentIndex, cards.length]);

  const handleEditPress = useCallback((id: string) => {
    setEditId(id);
    trackEvent(AnalyticsEventName.HANDLE_FLASHCARD_SHEET_OPEN, {
      mode: "edit",
      source: "session_screen",
    });
    handleFlashcardBottomSheetRef.current.present();
  }, []);

  const handleContinuePress = useCallback((id: string) => {
    trackEvent(AnalyticsEventName.SESSION_SKIP_SUGGESTION);
    if (!userPreferences.userHasEverSkippedSuggestion)
      userPreferences.setUserHasEverSkippedSuggestion(true);
    setWordsUpdates((prev) =>
      prev.filter((update) => update.flashcardId !== id),
    );
    setSkippedSuggestionsIds((prev) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  }, []);

  const handleFlipPress = (index: number, isFlipped: boolean) => {
    trackEvent(AnalyticsEventName.FLIP_FLASHCARD);
    if (!userPreferences.userHasEverHitFlashcard) {
      userPreferences.setUserHasEverHitFlashcard(true);
    }

    setFlippedCards((prev) => {
      const updated = [...prev];
      updated[index] = isFlipped;
      return updated;
    });
  };

  const speakWord = useCallback(
    (word: SessionWord, frontSide: boolean) => {
      const shouldSpeakTranslation = flipped ? !frontSide : frontSide;
      Speech.stop().then(() => {
        Speech.speak(shouldSpeakTranslation ? word?.translation : word.text, {
          language: shouldSpeakTranslation
            ? word.translationLang
            : word.mainLang,
        });
      });
    },
    [flipped],
  );

  const renderCard = (word: SessionWord, wordIndex: number) => {
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
        onFlipStart={(isFlipped: boolean) =>
          handleFlipPress(wordIndex, !isFlipped)
        }
        friction={6}
      >
        <Animated.View
          style={[
            styles.cardContent,
            { transform: [{ scale: scaleValues[wordIndex] }] },
          ]}
        >
          <Card
            word={word}
            wordIndex={wordIndex}
            frontSide={true}
            text={flipped ? word?.text : word?.translation}
            onBackPress={decrementCurrentIndex}
            onEditPress={handleEditPress}
            onContinuePress={handleContinuePress}
            onPlayAudio={speakWord}
            userHasEverSkippedSuggestion={
              userPreferences.userHasEverSkippedSuggestion
            }
          />
        </Animated.View>
        <Animated.View
          style={[
            styles.cardContent,
            { transform: [{ scale: scaleValues[wordIndex] }] },
          ]}
        >
          <Card
            word={word}
            wordIndex={wordIndex}
            frontSide={false}
            text={flipped ? word?.translation : word?.text}
            onBackPress={decrementCurrentIndex}
            onEditPress={handleEditPress}
            onContinuePress={handleContinuePress}
            onPlayAudio={speakWord}
            userHasEverSkippedSuggestion={
              userPreferences.userHasEverSkippedSuggestion
            }
          />
        </Animated.View>
      </FlipCard>
    );
  };

  useEffect(() => {
    const word = cards[currentIndex];
    if (!word) return;
    const speechSynthesizer =
      userPreferences.sessionSpeechSynthesizer && mainLang !== translationLang;
    if (
      ((flipped && !flippedCards[currentIndex]) ||
        (!flipped && flippedCards[currentIndex])) &&
      speechSynthesizer
    ) {
      Speech.stop().then(() => {
        Speech.speak(word?.text, { language: word.mainLang });
      });
    }
  }, [
    flipped,
    currentIndex,
    flippedCards,
    mainLang,
    translationLang,
    userPreferences.sessionSpeechSynthesizer,
  ]);

  const handleLevelPress = (level: EvaluationGrade) => {
    if (!userPreferences.userHasEverHitFlashcard) {
      hitFlashcardBottomSheetRef.current?.present();
      return;
    }

    const now = Date.now();
    if (now - lastPressTime < 300) return;
    setLastPressTime(now);

    triggerHaptics(Haptics.ImpactFeedbackStyle.Rigid);

    const currentCard = cards[currentIndex];
    const { id, type } = currentCard;

    if (type === "suggestion") {
      setSkippedSuggestionsIds((prev) =>
        prev.filter((suggestionId) => suggestionId !== id),
      );
      trackEvent(AnalyticsEventName.SESSION_ADD_SUGGESTION);
    }

    setWordsUpdates((prevUpdates) => {
      const existingUpdateIndex = prevUpdates.findIndex(
        (update) => update.flashcardId === id,
      );

      if (existingUpdateIndex >= 0) {
        const updatedUpdates = [...prevUpdates];
        updatedUpdates[existingUpdateIndex].grade = level;
        return updatedUpdates;
      } else {
        return [...prevUpdates, { flashcardId: id, type, grade: level }];
      }
    });
  };

  useEffect(() => {
    const evaluatedCount = wordsUpdates.length + skippedSuggestionsIds.length;
    if (evaluatedCount === 0) return;
    evaluatedCount === cards.length ? finishSession() : incrementCurrentIndex();
  }, [wordsUpdates, skippedSuggestionsIds]);

  const finishSession = () => {
    incrementCurrentIndex();
    confettiRef.current?.play(0);
    saveProgress(true);
    triggerHaptics(Haptics.ImpactFeedbackStyle.Heavy);
    trackEvent(AnalyticsEventName.FINISH_SESSION_SHEET_OPEN);
    finishSessionBottomSheetRef.current?.present();
  };

  useEffect(() => {
    setProgress(currentIndex);
    pagerRef.current.setPage(currentIndex);
  }, [currentIndex]);

  const endSession = () => {
    finishSessionBottomSheetRef.current?.dismiss();
    navigation.navigate(ScreenName.Tabs);
  };

  const startNewSession = () => {
    trackEvent(AnalyticsEventName.SESSION_STARTED, {
      length,
      mode,
      flashcardSide,
      restarted: true,
    });
    setFlippedCards(Array(length * 10).fill(false));
    setNumberOfSession((prev) => prev + 1);
    setWordsUpdates([]);
    setSkippedSuggestionsIds([]);
    setModel(wordSet.model);
    setVersion(wordSet.version);
    setCards(wordSet.sessionWords);
    setTimeout(() => {
      setCurrentIndex(0);
      finishSessionBottomSheetRef.current?.dismiss();
    }, 200);
  };

  const handleSessionExit = () => {
    saveProgress(false);
    trackEvent(AnalyticsEventName.SESSION_SKIPPED, {
      length,
      mode,
      flashcardSide,
      evaluatedCount: wordsUpdates.length,
    });
    navigation.navigate(ScreenName.Tabs);
  };

  const getSuggestionUpdates = (updates: WordUpdate[]) =>
    updates.filter((u) => u.type === "suggestion");

  const calculateAvgGrade = (updates: WordUpdate[]) =>
    updates.reduce((sum, u) => sum + u.grade, 0) / updates.length;

  const getWordsToAdd = (
    sessionWords: SessionWord[],
    suggestionUpdates: WordUpdate[],
  ) => {
    const ids = new Set(suggestionUpdates.map((u) => u.flashcardId));
    return sessionWords.filter((w) => ids.has(w.id));
  };

  const mapAddedWordsToSuggestions = (
    addedWords: Word[],
    sessionWords: SessionWord[],
  ) => {
    const map = new Map<string, Word>();

    for (const added of addedWords) {
      const match = sessionWords.find(
        (w) => w.text === added.text && w.translation === added.translation,
      );
      if (match) map.set(match.id, added);
    }

    return map;
  };

  const buildEvaluations = (
    updates: WordUpdate[],
    sessionId: string,
    map: Map<string, Word>,
  ) =>
    updates.map((update) => {
      const addedWord = map.get(update.flashcardId);
      const wordId =
        update.type === "word"
          ? update.flashcardId
          : (addedWord?.id ?? update.flashcardId);

      return { wordId, sessionId, grade: update.grade };
    });

  const saveProgress = useCallback(
    (finished: boolean) => {
      skipSuggestions(skippedSuggestionsIds, "skipped");

      if (wordsUpdates.length === 0) return;

      const suggestionUpdates = getSuggestionUpdates(wordsUpdates);
      skipSuggestions(
        suggestionUpdates.map((u) => u.flashcardId),
        "added",
      );

      const avgGrade = calculateAvgGrade(wordsUpdates);
      const { mainLang, translationLang } = wordSet.sessionWords[0];
      const wordsToAdd = getWordsToAdd(wordSet.sessionWords, suggestionUpdates);

      if (finished) {
        trackEvent(AnalyticsEventName.SESSION_COMPLETED, {
          length,
          mode,
          flashcardSide,
          avgGrade,
        });
      }

      const session = sessionsContext.addSession(
        mode,
        model,
        version,
        avgGrade,
        length * 10,
        mainLang,
        translationLang,
        finished,
      );

      const addedWords = addWords(
        wordsToAdd.map((w) => ({
          text: w.text,
          translation: w.translation,
        })),
        WordSource.LANGO,
      );

      const wordsMap = mapAddedWordsToSuggestions(
        addedWords,
        wordSet.sessionWords,
      );
      const evaluations = buildEvaluations(wordsUpdates, session.id, wordsMap);
      evaluationsContext.addEvaluations(evaluations);
    },
    [wordsUpdates, wordSet, skippedSuggestionsIds],
  );

  const handleWordEdit = (id: string, word: string, translation: string) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === id
          ? { ...card, text: word, translation: translation }
          : card,
      ),
    );
  };

  const handleSessionExitPress = () => {
    trackEvent(AnalyticsEventName.LEAVE_SESSION_SHEET_OPEN);
    leaveSessionBottomSheetRef.current?.present();
  };

  const handleSessionSettingsPress = () => {
    trackEvent(AnalyticsEventName.SESSION_SETTINGS_SHEET_OPEN);
    sessionSettingsBottomSheetRef.current?.present();
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topInsetSpacer,
          { height: insets.top, backgroundColor: colors.card },
        ]}
      />
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
      <HitFlashcardBottomSheet
        ref={hitFlashcardBottomSheetRef}
        onChangeIndex={(index) => setBottomSheetIsShown(index >= 0)}
      />
      <View
        style={[
          styles.sessionHeaderContainer,
          { backgroundColor: colors.card },
        ]}
      >
        <SessionHeader
          length={length}
          cardsSetLength={cards.length}
          progress={progress}
          onSessionExit={handleSessionExitPress}
          onSettingsPressed={handleSessionSettingsPress}
        />
        <View style={styles.progressBarWrapper}>
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
            {t("howWell")}
          </CustomText>
          <CustomText weight="Regular" style={styles.descriptionText}>
            {t("select_level")}
          </CustomText>
        </View>
        <View style={styles.levelsItemsContainer}>
          <WordLevelItem
            level={1}
            active={currentIndex < cards.length}
            style={styles.levelItem}
            onPress={handleLevelPress}
          />
          <WordLevelItem
            level={2}
            active={currentIndex < cards.length}
            style={styles.levelItem}
            onPress={handleLevelPress}
          />
          <WordLevelItem
            level={3}
            active={currentIndex < cards.length}
            style={styles.levelItem}
            onPress={handleLevelPress}
          />
        </View>
      </View>
      <View style={styles.lottieWrapper}>
        <LottieView
          ref={confettiRef}
          source={require("../../../assets/confetti.json")}
          autoPlay={false}
          loop={false}
          style={styles.lottie}
        />
      </View>
    </View>
  );
};

const getStyles = (colors: any, insets: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    pagerView: {
      flex: 1,
    },
    pagerViewItem: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "transparent",
    },
    card: {
      height: "100%",
      marginVertical: MARGIN_VERTICAL,
      marginHorizontal: MARGIN_HORIZONTAL,
    },
    cardContent: {
      flex: 1,
      width: "100%",
    },
    topInsetSpacer: {
      height: insets.top,
      backgroundColor: colors.card,
    },
    sessionHeaderContainer: {
      paddingBottom: 20,
    },
    progressBarWrapper: {
      marginHorizontal: MARGIN_HORIZONTAL,
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
      textAlign: "center",
    },
    descriptionText: {
      textAlign: "center",
      color: colors.primary600,
      opacity: 0.8,
      fontSize: 12,
    },
    textContainer: {
      marginVertical: 18,
    },
    levelItem: {
      flex: 1,
    },
    levelsItemsContainer: {
      flexDirection: "row",
      marginHorizontal: MARGIN_HORIZONTAL,
      marginBottom: MARGIN_VERTICAL,
      gap: 6,
    },
    lottieWrapper: {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
      position: "absolute",
      pointerEvents: "none",
    },
    lottie: {
      width: "100%",
      height: 600,
      pointerEvents: "none",
      position: "absolute",
      zIndex: 2,
      top: 0,
    },
  });
