import React, { FC, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from 'react-native-paper';

import { expo } from '../../../../app.json';
import { AnalyticsEventName } from '../../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { SessionMode } from '../../../constants/Session';
import { FlashcardSide, SessionLength } from '../../../constants/UserPreferences';
import {
    useLanguage,
    useStatistics,
    useSuggestions,
    useWords,
    useWordsHeuristicStates,
} from '../../../store';
import { useWordsMLStatesContext } from '../../../store/WordsMLStatesContext';
import { Streak } from '../../../types';
import { trackEvent } from '../../../utils/analytics';
import { getCurrentStreak, getPrevMilestone } from '../../../utils/streakUtils';
import { ActionButton, CustomText, SquareFlag } from '../../components';
import { FlashcardClassBadges } from '../../components/home/FlashcardClassBadges';
import { LanguageBottomSheet, StartSessionBottomSheet } from '../../sheets';
import { START_SESSION_BOTTOM_SHEET } from '../../sheets/StartSessionBottomSheet';
import { CustomTheme } from '../../Theme';

type HeaderCardProps = {
    navigateToSessionScreen(
        length: SessionLength,
        mode: SessionMode,
        flashcardSide: FlashcardSide,
    ): void;
};

const HOME_LANGUAGE_SHEET_NAME = 'home-language-sheet';

export const HeaderCard: FC<HeaderCardProps> = ({ navigateToSessionScreen }) => {
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;
    const { mainLang } = useLanguage();
    const { langSuggestions } = useSuggestions();
    const { langWords } = useWords();
    const { langWordsHeuristicStates } = useWordsHeuristicStates();
    const { langWordsMLStates } = useWordsMLStatesContext();
    const { studyDaysList } = useStatistics();

    const [streak, setStreak] = useState<Streak>({
        active: false,
        numberOfDays: 0,
    });

    const styles = useMemo(() => getStyles(colors), [colors]);

    const last50Words = useMemo(
        () =>
            [...langWords]
                .sort((a, b) => new Date(b.addDate).getTime() - new Date(a.addDate).getTime())
                .slice(0, 50)
                .map(word => word.id),
        [langWords],
    );

    const langWordsHeuristicStatesFiltered = useMemo(
        () => langWordsHeuristicStates.filter(word => last50Words.includes(word.wordId)),
        [langWordsHeuristicStates, last50Words],
    );

    const lastWellKnownWords = useMemo(() => {
        if (last50Words.length < 5) return 1;
        const now = new Date();
        return (
            Math.round(
                (langWordsHeuristicStatesFiltered.filter(
                    word => word.studyCount > 2 && new Date(word.nextReviewDate) > now,
                ).length /
                    last50Words.length) *
                    100,
            ) / 100
        );
    }, [langWordsHeuristicStatesFiltered, last50Words]);

    const wellKnownWords = useMemo(
        () => (langWordsMLStates ?? []).filter(w => w.gradeThreeProb >= 0.6).length,
        [langWordsMLStates],
    );

    useLayoutEffect(() => {
        setStreak(getCurrentStreak(studyDaysList));
    }, [studyDaysList]);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', state => {
            if (state !== 'active') return;
            setStreak(getCurrentStreak(studyDaysList));
        });

        return () => subscription.remove();
    }, [studyDaysList]);

    const handleActionButtonPress = useCallback(() => {
        trackEvent(AnalyticsEventName.START_SESSION_SHEET_OPEN);
        TrueSheet.present(START_SESSION_BOTTOM_SHEET);
    }, []);

    const handleSessionStart = useCallback(
        (length: SessionLength, mode: SessionMode, flashcardSide: FlashcardSide) => {
            TrueSheet.dismissAll();
            navigateToSessionScreen(length, mode, flashcardSide);
        },
        [navigateToSessionScreen],
    );

    const reportMessage = useMemo(() => {
        const percentage = Math.floor(lastWellKnownWords * 100);

        if (langWordsHeuristicStates.length < 5) return t('report1');
        if (wellKnownWords <= 10 && lastWellKnownWords < 0.1) return t('report2');
        if (wellKnownWords > 10 && lastWellKnownWords < 0.1)
            return t('report3', { wellKnownWords });
        if (lastWellKnownWords >= 0.1 && wellKnownWords <= 10) return t('report4', { percentage });
        if (lastWellKnownWords >= 0.9) return t('report5', { percentage, wellKnownWords });
        return t('report6', { percentage, wellKnownWords });
    }, [lastWellKnownWords, wellKnownWords, langWordsHeuristicStates.length, t]);

    const handleLanguageSheetOpen = useCallback(() => {
        trackEvent(AnalyticsEventName.LANGUAGE_SHEET_OPEN, {
            source: 'main_screen',
            type: 'main',
        });
        TrueSheet.present(HOME_LANGUAGE_SHEET_NAME);
    }, []);

    const isGoal = streak.active && streak.numberOfDays === getPrevMilestone(streak.numberOfDays);

    return (
        <View style={styles.root}>
            <StartSessionBottomSheet onSessionStart={handleSessionStart} />
            <LanguageBottomSheet sheetName={HOME_LANGUAGE_SHEET_NAME} />
            <View style={styles.container}>
                <CustomText style={styles.mainText} weight={'Bold'}>
                    {expo.name}
                </CustomText>
                <MaterialCommunityIcons
                    name={'fire'}
                    size={32}
                    color={
                        streak.active ? (isGoal ? colors.yellow : colors.red) : colors.cardAccent300
                    }
                />
                <CustomText
                    weight={'Bold'}
                    style={[
                        styles.streakText,
                        isGoal && { color: colors.yellow },
                        !streak.active && styles.inactiveStreak,
                    ]}
                >
                    {streak.numberOfDays.toString()}
                </CustomText>
                <Pressable style={styles.flag} onPress={handleLanguageSheetOpen}>
                    <SquareFlag languageCode={mainLang} size={24} />
                </Pressable>
            </View>

            <ProgressBar
                animatedValue={lastWellKnownWords || 0.000001}
                color={colors.primary300}
                style={styles.progressBar}
            />
            <CustomText style={styles.descText}>{reportMessage}</CustomText>

            <FlashcardClassBadges mlStates={langWordsMLStates ?? []} />

            <ActionButton
                active={langWords.length + langSuggestions.length >= 5}
                icon={'play'}
                label={t('startLearning')}
                primary={true}
                style={styles.actionButton}
                onPress={handleActionButtonPress}
            />
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        actionButton: {
            marginTop: 18,
        },
        container: {
            alignItems: 'center',
            flexDirection: 'row',
        },
        descText: {
            color: colors.white,
            fontSize: 14,
            lineHeight: 22,
            marginTop: 12,
            opacity: 0.8,
        },
        flag: {
            paddingLeft: 5,
            paddingVertical: 5,
        },
        inactiveStreak: {
            color: colors.cardAccent300,
        },
        mainText: {
            color: colors.white,
            flex: 1,
            fontSize: 26,
        },
        progressBar: {
            backgroundColor: colors.cardAccent300,
            borderRadius: spacing.s,
            height: 7,
            marginTop: 12,
        },
        root: {
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL,
        },
        streakText: {
            color: colors.white,
            fontSize: 18,
            marginRight: 15,
        },
    });
