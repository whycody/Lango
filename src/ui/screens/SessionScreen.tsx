import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, BackHandler, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useFocusEffect, useRoute, useTheme } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';
import PagerView from 'react-native-pager-view';
import { ProgressBar } from 'react-native-paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { EvaluationGrade } from '../../constants/Evaluation';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { SessionMode } from '../../constants/Session';
import { FlashcardSide, SessionLength } from '../../constants/UserPreferences';
import { WordSource } from '../../constants/Word';
import { useHaptics, useWordSet } from '../../hooks';
import { RootStackParamList, ScreenName } from '../../navigation/navigationTypes';
import {
    useAuth,
    useDebouncedSyncSuggestions,
    useEvaluations,
    useLanguage,
    useSessions,
    useStatistics,
    useSuggestions,
    useUserPreferences,
    useWords,
} from '../../store';
import { SessionWord, Word, WordUpdate } from '../../types';
import { trackEvent } from '../../utils/analytics';
import { getCurrentStreak } from '../../utils/streakUtils';
import { CustomText } from '../components';
import { Card, FlipCard, SessionHeader, WordLevelItem } from '../components/session';
import {
    FinishSessionBottomSheet,
    HandleFlashcardBottomSheet,
    HitFlashcardBottomSheet,
    LeaveSessionBottomSheet,
    SessionSettingsBottomSheet,
} from '../sheets';
import { StreakBottomSheet } from '../sheets/StreakBottomSheet';
import { WordSuggestionBottomSheet } from '../sheets/WordSuggestionBottomSheet';
import { CustomTheme } from '../Theme';

export type SessionScreenParams = {
    flashcardSide: FlashcardSide;
    length: SessionLength;
    mode: SessionMode;
};

const SESSION_HANDLE_FLASHCARD_BOTTOM_SHEET = 'session-handle-flashcard-bottom-sheet';
const SESSION_HIT_FLASHCARD_BOTTOM_SHEET = 'session-hit-flashcard-bottom-sheet';
const SESSION_LEAVE_SESSION_BOTTOM_SHEET = 'session-leave-session-bottom-sheet';
const SESSION_FINISH_SESSION_BOTTOM_SHEET = 'session-finish-session-bottom-sheet';
const SESSION_SETTINGS_BOTTOM_SHEET = 'session-settings-bottom-sheet';
const SESSION_STREAK_BOTTOM_SHEET = 'session-streak-bottom-sheet';
const SESSION_WORD_SUGGESTION_BOTTOM_SHEET = 'session-word-suggestion-bottom-sheet';

type SessionScreenProps = NativeStackScreenProps<RootStackParamList, ScreenName.Session>;

export const SessionScreen = ({ navigation, route }: SessionScreenProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;
    const insets = useSafeAreaInsets();
    const styles = getStyles(colors, insets);

    const params = route.params as SessionScreenParams;
    const length = params?.length || 1;
    const mode = params?.mode || SessionMode.STUDY;
    const flashcardSide = params?.flashcardSide || FlashcardSide.WORD;

    const sessionsContext = useSessions();
    const evaluationsContext = useEvaluations();
    const { addWords } = useWords();
    const { skipSuggestions, syncSuggestions } = useSuggestions();

    const userPreferences = useUserPreferences();
    const { mainLang, translationLang } = useLanguage();
    const { triggerHaptics } = useHaptics();

    const { updateUserFinishedOnboarding, user } = useAuth();
    const wordSet = useWordSet(length * (!user?.finishedOnboarding ? 5 : 10), mode);

    useEffect(() => {
        navigation.setOptions({ gestureEnabled: false });
        return () => {
            navigation.setOptions({ gestureEnabled: true });
        };
    }, [navigation]);

    const confettiRef = useRef<LottieView>(null);
    const pagerRef = useRef<PagerView>(null);
    const isInitial = useRef(true);

    const [version, setVersion] = useState(wordSet.version);
    const [model, setModel] = useState(wordSet.model);
    const [cards, setCards] = useState(wordSet.sessionWords);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [flipped, setFlipped] = useState(flashcardSide === FlashcardSide.TRANSLATION);

    const [editId, setEditId] = useState<string | undefined>();
    const [numberOfSession, setNumberOfSession] = useState(0);
    const [lastPressTime, setLastPressTime] = useState<number>(0);
    const [scaleValues] = useState(
        cards.map((_, index) => new Animated.Value(index === 0 ? 1 : 0.8)),
    );
    const prevActiveIndexRef = useRef(0);

    const [wordsUpdates, setWordsUpdates] = useState<WordUpdate[]>([]);
    const [skippedSuggestionsIds, setSkippedSuggestionsIds] = useState<string[]>([]);
    const [flippedCards, setFlippedCards] = useState(Array(length * 10).fill(false));

    const { studyDaysList } = useStatistics();
    const streak = getCurrentStreak(studyDaysList);

    useLayoutEffect(() => {
        confettiRef.current?.reset();
    }, []);

    useEffect(() => {
        if (isInitial.current) {
            isInitial.current = false;
            return;
        }

        setFlipped(userPreferences.flashcardSide === FlashcardSide.TRANSLATION);
    }, [userPreferences.flashcardSide]);

    useFocusEffect(
        useCallback(() => {
            const handleBackPress = () => {
                trackEvent(AnalyticsEventName.LEAVE_SESSION_SHEET_OPEN);
                if (!user?.finishedOnboarding) return true;
                TrueSheet.present(SESSION_LEAVE_SESSION_BOTTOM_SHEET);
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

            return () => {
                subscription.remove();
            };
        }, [user?.finishedOnboarding]),
    );

    const decrementCurrentIndex = useCallback(() => {
        setCurrentIndex(prev => (prev == 0 ? prev : prev - 1));
    }, []);

    const incrementCurrentIndex = useCallback(() => {
        if (currentIndex < cards.length) setCurrentIndex(prev => prev + 1);
    }, [currentIndex, cards.length]);

    const handleEditPress = useCallback((id: string) => {
        setEditId(id);
        trackEvent(AnalyticsEventName.HANDLE_FLASHCARD_SHEET_OPEN, {
            mode: 'edit',
            source: 'session_screen',
        });
        TrueSheet.present(SESSION_HANDLE_FLASHCARD_BOTTOM_SHEET);
    }, []);

    const handleContinuePress = useCallback((id: string) => {
        trackEvent(AnalyticsEventName.SESSION_SKIP_SUGGESTION);
        if (!userPreferences.userHasEverSkippedSuggestion)
            userPreferences.setUserHasEverSkippedSuggestion(true);
        setWordsUpdates(prev => prev.filter(update => update.flashcardId !== id));
        setSkippedSuggestionsIds(prev => (prev.includes(id) ? prev : [...prev, id]));
    }, []);

    const handleFlipPress = (index: number, isFlipped: boolean) => {
        trackEvent(AnalyticsEventName.FLIP_FLASHCARD);
        if (!userPreferences.userHasEverHitFlashcard) {
            userPreferences.setUserHasEverHitFlashcard(true);
        }

        setFlippedCards(prev => {
            const updated = [...prev];
            updated[index] = isFlipped;
            return updated;
        });
    };

    const speakWord = useCallback(
        (word: SessionWord, frontSide: boolean) => {
            const shouldSpeakTranslation = flipped ? !frontSide : frontSide;
            const text = shouldSpeakTranslation ? word.translation : word.text;
            const language = shouldSpeakTranslation ? word.translationLang : word.mainLang;
            Speech.stop();
            Speech.speak(text, { language });
        },
        [flipped],
    );

    const renderCard = (word: SessionWord, wordIndex: number) => {
        const isActive = currentIndex === wordIndex;

        return (
            <FlipCard
                clickable={isActive}
                flipHorizontal={true}
                flipVertical={false}
                style={styles.card}
                useNativeDriver={true}
                onFlipStart={(isFlipped: boolean) => handleFlipPress(wordIndex, !isFlipped)}
            >
                <Animated.View
                    style={[styles.cardContent, { transform: [{ scale: scaleValues[wordIndex] }] }]}
                >
                    <Card
                        frontSide={true}
                        showTapSuggestion={!userPreferences.userHasEverHitFlashcard && isActive}
                        text={flipped ? word?.text : word?.translation}
                        userHasEverSkippedSuggestion={userPreferences.userHasEverSkippedSuggestion}
                        word={word}
                        wordIndex={wordIndex}
                        example={
                            word.example && (flipped ? word.example.source : word.example.target)
                        }
                        onBackPress={decrementCurrentIndex}
                        onContinuePress={handleContinuePress}
                        onEditPress={handleEditPress}
                        onPlayAudio={speakWord}
                    />
                </Animated.View>
                <Animated.View
                    style={[styles.cardContent, { transform: [{ scale: scaleValues[wordIndex] }] }]}
                >
                    <Card
                        frontSide={false}
                        showTapSuggestion={!userPreferences.userHasEverHitFlashcard && isActive}
                        text={flipped ? word?.translation : word?.text}
                        userHasEverSkippedSuggestion={userPreferences.userHasEverSkippedSuggestion}
                        word={word}
                        wordIndex={wordIndex}
                        example={
                            word.example && (flipped ? word.example.target : word.example.source)
                        }
                        onBackPress={decrementCurrentIndex}
                        onContinuePress={handleContinuePress}
                        onEditPress={handleEditPress}
                        onPlayAudio={speakWord}
                    />
                </Animated.View>
            </FlipCard>
        );
    };

    useEffect(() => {
        const previousIndex = prevActiveIndexRef.current;
        const currentScale = scaleValues[currentIndex];
        const previousScale = scaleValues[previousIndex];

        if (previousIndex !== currentIndex && previousScale) {
            Animated.spring(previousScale, {
                friction: 6,
                toValue: 0.8,
                useNativeDriver: true,
            }).start();
        }

        if (currentScale) {
            Animated.spring(currentScale, {
                friction: 6,
                toValue: 1,
                useNativeDriver: true,
            }).start();
        }

        prevActiveIndexRef.current = currentIndex;
    }, [currentIndex, scaleValues]);

    useEffect(() => {
        const word = cards[currentIndex];
        const isSuggestion = !!word && word.type === 'suggestion';
        const shouldShowSuggestionSheet =
            isSuggestion && !userPreferences.userHasEverSeenSuggestionInSession;
        if (!shouldShowSuggestionSheet) return;
        setTimeout(() => {
            TrueSheet.present(SESSION_WORD_SUGGESTION_BOTTOM_SHEET);
        }, 550);
    }, [cards, currentIndex, userPreferences.userHasEverSeenSuggestionInSession]);

    useEffect(() => {
        const word = cards[currentIndex];
        if (!word) return;
        const speechSynthesizer =
            userPreferences.sessionSpeechSynthesizer && mainLang !== translationLang;
        const isFrontSide = !flippedCards[currentIndex];
        const shouldSpeak = (flipped && isFrontSide) || (!flipped && !isFrontSide);
        if (shouldSpeak && speechSynthesizer) {
            Speech.stop();
            Speech.speak(word?.text, { language: word.mainLang });
        }
    }, [
        flipped,
        cards,
        currentIndex,
        flippedCards,
        mainLang,
        translationLang,
        userPreferences.sessionSpeechSynthesizer,
    ]);

    const handleLevelPress = (level: EvaluationGrade) => {
        if (!userPreferences.userHasEverHitFlashcard) {
            TrueSheet.present(SESSION_HIT_FLASHCARD_BOTTOM_SHEET);
            return;
        }

        const now = Date.now();
        if (now - lastPressTime < 300) return;
        setLastPressTime(now);

        triggerHaptics('rigid');

        const currentCard = cards[currentIndex];
        const { id, type } = currentCard;

        if (type === 'suggestion') {
            setSkippedSuggestionsIds(prev => prev.filter(suggestionId => suggestionId !== id));
            trackEvent(AnalyticsEventName.SESSION_ADD_SUGGESTION);
        }

        setWordsUpdates(prevUpdates => {
            const existingUpdateIndex = prevUpdates.findIndex(update => update.flashcardId === id);

            if (existingUpdateIndex >= 0) {
                const updatedUpdates = [...prevUpdates];
                updatedUpdates[existingUpdateIndex].grade = level;
                return updatedUpdates;
            } else {
                return [...prevUpdates, { flashcardId: id, grade: level, type }];
            }
        });
    };

    useEffect(() => {
        const evaluatedCount = wordsUpdates.length + skippedSuggestionsIds.length;
        if (evaluatedCount === 0) return;
        evaluatedCount === cards.length ? finishSession() : incrementCurrentIndex();
    }, [wordsUpdates, skippedSuggestionsIds]);

    const finishSession = () => {
        const shouldDisplayStreakSheet = !streak.active && wordsUpdates.length > 0;
        incrementCurrentIndex();
        confettiRef.current?.play(0);
        saveProgress(true);
        triggerHaptics('heavy');
        trackEvent(AnalyticsEventName.FINISH_SESSION_SHEET_OPEN);
        if (!user?.finishedOnboarding) updateUserFinishedOnboarding(true);
        if (shouldDisplayStreakSheet) triggerHaptics('heavy');
        TrueSheet.present(
            shouldDisplayStreakSheet
                ? SESSION_STREAK_BOTTOM_SHEET
                : SESSION_FINISH_SESSION_BOTTOM_SHEET,
        );
    };

    useEffect(() => {
        setProgress(currentIndex);
        if (currentIndex > cards.length - 1) return;
        pagerRef.current?.setPage?.(currentIndex);
    }, [currentIndex]);

    const endSession = () => {
        TrueSheet.dismissAll();
        navigation.reset({
            index: 0,
            routes: [{ name: ScreenName.Tabs }],
        });
    };

    const startNewSession = () => {
        trackEvent(AnalyticsEventName.SESSION_STARTED, {
            flashcardSide,
            length,
            mode,
            restarted: true,
        });
        setFlippedCards(Array(length * 10).fill(false));
        setNumberOfSession(prev => prev + 1);
        setWordsUpdates([]);
        setSkippedSuggestionsIds([]);
        setModel(wordSet.model);
        setVersion(wordSet.version);
        setCards(wordSet.sessionWords);
        setTimeout(() => {
            setCurrentIndex(0);
            TrueSheet.dismissAll();
        }, 200);
    };

    const handleSessionExit = () => {
        saveProgress(false);
        trackEvent(AnalyticsEventName.SESSION_SKIPPED, {
            evaluatedCount: wordsUpdates.length,
            flashcardSide,
            length,
            mode,
        });
        navigation.reset({
            index: 0,
            routes: [{ name: ScreenName.Tabs }],
        });
    };

    const getSuggestionUpdates = (updates: WordUpdate[]) =>
        updates.filter(u => u.type === 'suggestion');

    const calculateAvgGrade = (updates: WordUpdate[]) =>
        updates.reduce((sum, u) => sum + u.grade, 0) / updates.length;

    const getWordsToAdd = (sessionWords: SessionWord[], suggestionUpdates: WordUpdate[]) => {
        const ids = new Set(suggestionUpdates.map(u => u.flashcardId));
        return sessionWords.filter(w => ids.has(w.id));
    };

    const mapAddedWordsToSuggestions = (addedWords: Word[], sessionWords: SessionWord[]) => {
        const map = new Map<string, Word>();

        for (const added of addedWords) {
            const match = sessionWords.find(
                w => w.text === added.text && w.translation === added.translation,
            );
            if (match) map.set(match.id, added);
        }

        return map;
    };

    const buildEvaluations = (updates: WordUpdate[], sessionId: string, map: Map<string, Word>) =>
        updates.map(update => {
            const addedWord = map.get(update.flashcardId);
            const wordId =
                update.type === 'word' ? update.flashcardId : (addedWord?.id ?? update.flashcardId);

            return { grade: update.grade, sessionId, wordId };
        });

    const debouncedSyncSuggestions = useDebouncedSyncSuggestions(syncSuggestions, 1000);

    const saveProgress = useCallback(
        (finished: boolean) => {
            const { mainLang, translationLang } = wordSet.sessionWords[0];

            if (mainLang !== translationLang) {
                skipSuggestions(skippedSuggestionsIds, 'skipped').then(debouncedSyncSuggestions);
            }
            if (wordsUpdates.length === 0) return;

            const suggestionUpdates = getSuggestionUpdates(wordsUpdates);
            if (suggestionUpdates.length > 0) {
                skipSuggestions(
                    suggestionUpdates.map(u => u.flashcardId),
                    'added',
                ).then(debouncedSyncSuggestions);
            }

            const avgGrade = calculateAvgGrade(wordsUpdates);
            const wordsToAdd = getWordsToAdd(wordSet.sessionWords, suggestionUpdates);

            if (finished) {
                trackEvent(AnalyticsEventName.SESSION_COMPLETED, {
                    avgGrade,
                    flashcardSide,
                    length,
                    mode,
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
                wordsToAdd.map(w => ({
                    text: w.text,
                    translation: w.translation,
                })),
                WordSource.LANGO,
            );

            const wordsMap = mapAddedWordsToSuggestions(addedWords, wordSet.sessionWords);
            const evaluations = buildEvaluations(wordsUpdates, session.id, wordsMap);
            evaluationsContext.addEvaluations(evaluations);
        },
        [wordsUpdates, wordSet, skippedSuggestionsIds],
    );

    const handleWordEdit = (id: string, word: string, translation: string) => {
        setCards(prevCards =>
            prevCards.map(card => (card.id === id ? { ...card, text: word, translation } : card)),
        );
    };

    const handleSessionExitPress = () => {
        trackEvent(AnalyticsEventName.LEAVE_SESSION_SHEET_OPEN);
        TrueSheet.present(SESSION_LEAVE_SESSION_BOTTOM_SHEET);
    };

    const handleSessionSettingsPress = () => {
        trackEvent(AnalyticsEventName.SESSION_SETTINGS_SHEET_OPEN);
        TrueSheet.present(SESSION_SETTINGS_BOTTOM_SHEET);
    };

    return (
        <>
            <WordSuggestionBottomSheet sheetName={SESSION_WORD_SUGGESTION_BOTTOM_SHEET} />
            <LeaveSessionBottomSheet
                leaveSession={handleSessionExit}
                sheetName={SESSION_LEAVE_SESSION_BOTTOM_SHEET}
            />
            <HandleFlashcardBottomSheet
                flashcardId={editId}
                sheetName={SESSION_HANDLE_FLASHCARD_BOTTOM_SHEET}
                onWordEdit={handleWordEdit}
            />
            <FinishSessionBottomSheet
                endSession={endSession}
                flashcardUpdates={wordsUpdates}
                sheetName={SESSION_FINISH_SESSION_BOTTOM_SHEET}
                startNewSession={startNewSession}
            />
            <StreakBottomSheet
                finishSessionBottomSheetName={SESSION_FINISH_SESSION_BOTTOM_SHEET}
                sheetName={SESSION_STREAK_BOTTOM_SHEET}
                streak={streak}
            />
            <SessionSettingsBottomSheet sheetName={SESSION_SETTINGS_BOTTOM_SHEET} />
            <HitFlashcardBottomSheet sheetName={SESSION_HIT_FLASHCARD_BOTTOM_SHEET} />
            <View style={styles.container}>
                <View
                    style={[
                        styles.topInsetSpacer,
                        { backgroundColor: colors.card, height: insets.top },
                    ]}
                />

                <View style={[styles.sessionHeaderContainer, { backgroundColor: colors.card }]}>
                    <SessionHeader
                        allowExit={!!user?.finishedOnboarding}
                        cardsSetLength={cards.length}
                        length={length}
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
                    initialPage={0}
                    keyboardDismissMode="none"
                    offscreenPageLimit={2}
                    orientation="horizontal"
                    pageMargin={10}
                    ref={pagerRef}
                    scrollEnabled={false}
                    style={styles.pagerView}
                >
                    {cards.map((word, index) => (
                        <View key={word.id + numberOfSession} style={styles.pagerViewItem}>
                            {Math.abs(index - currentIndex) <= 1 ? (
                                renderCard(word, index)
                            ) : (
                                <View style={styles.cardPlaceholder} />
                            )}
                        </View>
                    ))}
                </PagerView>
                <View style={styles.bottomBarContainer}>
                    <View style={styles.textContainer}>
                        <CustomText style={styles.headerText} weight="SemiBold">
                            {t('howWell')}
                        </CustomText>
                        <CustomText style={styles.descriptionText} weight="Regular">
                            {t('select_level')}
                        </CustomText>
                    </View>
                    <View style={styles.levelsItemsContainer}>
                        <WordLevelItem
                            active={currentIndex < cards.length}
                            level={1}
                            style={styles.levelItem}
                            onPress={handleLevelPress}
                        />
                        <WordLevelItem
                            active={currentIndex < cards.length}
                            level={2}
                            style={styles.levelItem}
                            onPress={handleLevelPress}
                        />
                        <WordLevelItem
                            active={currentIndex < cards.length}
                            level={3}
                            style={styles.levelItem}
                            onPress={handleLevelPress}
                        />
                    </View>
                </View>
                <View style={styles.lottieWrapper}>
                    <LottieView
                        autoPlay={false}
                        loop={false}
                        ref={confettiRef}
                        source={require('../../../assets/confetti.json')}
                        style={styles.lottie}
                    />
                </View>
            </View>
        </>
    );
};

const getStyles = (colors: CustomTheme['colors'], insets: EdgeInsets) =>
    StyleSheet.create({
        bottomBarContainer: {
            backgroundColor: colors.card,
        },
        card: {
            alignSelf: 'stretch',
            flex: 1,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginVertical: MARGIN_VERTICAL,
        },
        cardContent: {
            flex: 1,
            width: '100%',
        },
        cardPlaceholder: {
            flex: 1,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginVertical: MARGIN_VERTICAL,
        },
        container: {
            flex: 1,
        },
        descriptionText: {
            color: colors.primary600,
            fontSize: 12,
            opacity: 0.8,
            textAlign: 'center',
        },
        headerText: {
            color: colors.primary300,
            textAlign: 'center',
        },
        levelItem: {
            flex: 1,
        },
        levelsItemsContainer: {
            flexDirection: 'row',
            gap: 6,
            marginBottom: MARGIN_VERTICAL,
            marginHorizontal: MARGIN_HORIZONTAL,
        },
        lottie: {
            height: 600,
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            width: '100%',
            zIndex: 2,
        },
        lottieWrapper: {
            bottom: 0,
            left: 0,
            pointerEvents: 'none',
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 2,
        },
        pagerView: {
            flex: 1,
        },
        pagerViewItem: {
            alignItems: 'center',
            backgroundColor: 'transparent',
            flex: 1,
            justifyContent: 'center',
        },
        progressBar: {
            backgroundColor: colors.cardAccent,
            height: 5,
            marginTop: 12,
        },
        progressBarWrapper: {
            marginHorizontal: MARGIN_HORIZONTAL,
        },
        sessionHeaderContainer: {
            paddingBottom: 20,
        },
        textContainer: {
            marginVertical: 18,
        },
        topInsetSpacer: {
            backgroundColor: colors.card,
            height: insets.top,
        },
    });
