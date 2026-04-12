import React, { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { ProgressBar } from 'react-native-paper';

import { expo } from '../../../../app.json';
import { AnalyticsEventName } from '../../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { SessionMode } from '../../../constants/Session';
import { FlashcardSide, SessionLength } from '../../../constants/UserPreferences';
import {
    useLanguage,
    useStatistics,
    useSuggestions,
    useWords,
    useWordsHeuristicStates,
} from '../../../store';
import { Streak } from '../../../types';
import { trackEvent } from '../../../utils/analytics';
import { getCurrentStreak } from '../../../utils/streakUtils';
import { ActionButton, CustomText, SquareFlag } from '../../components';
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

export const HeaderCard: FC<HeaderCardProps> = ({ navigateToSessionScreen }) => {
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;
    const { mainLang } = useLanguage();
    const { langSuggestions } = useSuggestions();
    const { langWords } = useWords();
    const { langWordsHeuristicStates } = useWordsHeuristicStates();
    const { studyDaysList } = useStatistics();

    const [streak, setStreak] = useState<Streak>({
        active: false,
        numberOfDays: 0,
    });

    const styles = getStyles(colors);
    const languageSheetRef = useRef<BottomSheetModal>(null);

    const last50Words = langWords
        .sort((a, b) => new Date(b.addDate).getTime() - new Date(a.addDate).getTime())
        .slice(0, 50)
        .map(word => word.id);
    const langWordsHeuristicStatesFiltered = langWordsHeuristicStates.filter(word =>
        last50Words.includes(word.wordId),
    );

    const lastWellKnownWords =
        last50Words.length < 5
            ? 1
            : Math.round(
                  (langWordsHeuristicStatesFiltered.filter(
                      word => word.studyCount > 2 && new Date(word.nextReviewDate) > new Date(),
                  ).length /
                      last50Words.length) *
                      100,
              ) / 100;
    const wellKnownWords = langWordsHeuristicStates.filter(word => word.studyCount > 2).length;

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

    const handleActionButtonPress = () => {
        trackEvent(AnalyticsEventName.START_SESSION_SHEET_OPEN);
        TrueSheet.present(START_SESSION_BOTTOM_SHEET);
    };

    const handleSessionStart = (
        length: SessionLength,
        mode: SessionMode,
        flashcardSide: FlashcardSide,
    ) => {
        TrueSheet.dismiss(START_SESSION_BOTTOM_SHEET);
        navigateToSessionScreen(length, mode, flashcardSide);
    };

    const getReportMessage = () => {
        const percentage = Math.floor(lastWellKnownWords * 100);

        if (langWordsHeuristicStates.length < 5) return t('report1');
        if (wellKnownWords <= 10 && lastWellKnownWords < 0.1) return t('report2');
        if (wellKnownWords > 10 && lastWellKnownWords < 0.1)
            return t('report3', { wellKnownWords });
        if (lastWellKnownWords >= 0.1 && wellKnownWords <= 10) return t('report4', { percentage });
        if (lastWellKnownWords >= 0.9) return t('report5', { percentage, wellKnownWords });
        return t('report6', { percentage, wellKnownWords });
    };

    const handleLanguageSheetOpen = () => {
        trackEvent(AnalyticsEventName.LANGUAGE_SHEET_OPEN, {
            source: 'main_screen',
            type: 'main',
        });
        languageSheetRef.current.present();
    };

    return (
        <View style={styles.root}>
            <StartSessionBottomSheet onSessionStart={handleSessionStart} />
            <LanguageBottomSheet ref={languageSheetRef} />
            <View style={styles.container}>
                <CustomText style={styles.mainText} weight={'Bold'}>
                    {expo.name}
                </CustomText>
                <MaterialCommunityIcons
                    color={streak.active ? colors.red : colors.primary600}
                    name={'fire'}
                    size={30}
                />
                <CustomText
                    style={[styles.streakText, !streak.active && styles.inactiveStreak]}
                    weight={'Bold'}
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
            <CustomText style={styles.descText}>{getReportMessage()}</CustomText>

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

const getStyles = (colors: any) =>
    StyleSheet.create({
        actionButton: {
            marginTop: 32,
        },
        container: {
            alignItems: 'center',
            flexDirection: 'row',
        },
        descText: {
            color: colors.primary600,
            fontSize: 15,
            marginTop: 16,
        },
        flag: {
            paddingLeft: 5,
            paddingVertical: 5,
        },
        inactiveStreak: {
            color: colors.primary600,
        },
        mainText: {
            color: colors.primary,
            flex: 1,
            fontSize: 26,
        },
        progressBar: {
            backgroundColor: colors.cardAccent300,
            height: 7,
            marginTop: 12,
        },
        root: {
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL,
        },
        streakText: {
            color: colors.primary,
            fontSize: 18,
            marginRight: 15,
        },
    });
