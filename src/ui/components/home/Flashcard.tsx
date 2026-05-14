import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Foundation } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { AnalyticsEventName } from '../../../constants/AnalyticsEventName';
import { WordSource } from '../../../constants/Word';
import { useHaptics } from '../../../hooks';
import { useLanguage, useWords } from '../../../store';
import { Suggestion } from '../../../types';
import { trackEvent } from '../../../utils/analytics';
import { CustomTheme } from '../../Theme';
import { CustomText, SquareFlag } from '..';
import { FlipCard } from '../session';

interface FlashcardProps {
    onFlashcardPress?: (add: boolean) => void;
    style?: StyleProp<ViewStyle>;
    suggestion?: Suggestion;
}

export const Flashcard = forwardRef(
    ({ onFlashcardPress, style, suggestion }: FlashcardProps, ref) => {
        const [flippable, setFlippable] = useState(true);
        const [newFlashcardIsReady, setNewFlashcardIsReady] = useState(false);
        const [readyToFlip, setReadyToFlip] = useState(false);
        const [flip, setFlip] = useState(false);
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);
        const { t } = useTranslation();
        const wordsContext = useWords();
        const languageContext = useLanguage();
        const { triggerHaptics } = useHaptics();

        useImperativeHandle(ref, () => ({
            flippable: readyToFlip,
            flipWithoutAdd: () => handleFlip(false),
        }));

        const getRandomMessage = () => {
            const messages = [t('wordAdded1'), t('wordAdded2'), t('wordAdded3')];

            const randomIndex = Math.floor(Math.random() * messages.length);
            return messages[randomIndex];
        };

        const [backText, setBackText] = useState(getRandomMessage());

        useEffect(() => {
            setNewFlashcardIsReady(true);
        }, [suggestion]);

        useEffect(() => {
            if (!newFlashcardIsReady || !readyToFlip) return;
            setNewFlashcardIsReady(false);
            setReadyToFlip(false);
            setFlip(false);
            setTimeout(() => {
                setBackText(getRandomMessage());
                setFlippable(true);
            }, 200);
        }, [setNewFlashcardIsReady, newFlashcardIsReady, readyToFlip]);

        const handleFlip = (add: boolean = true) => {
            if (!flippable) return;
            setFlip(true);
            setFlippable(false);
            setNewFlashcardIsReady(false);
            triggerHaptics('rigid');
            if (add && suggestion) {
                const addWord = wordsContext.addWord(
                    suggestion.word,
                    suggestion.translation,
                    WordSource.LANGO,
                );
                trackEvent(AnalyticsEventName.SUGGESTION_ADD, {
                    successfully: !!addWord,
                    suggestionId: suggestion.id,
                });
                if (!addWord) setBackText(t('wordNotAdded'));
            } else setBackText(t('change_flashcard'));
            setTimeout(() => onFlashcardPress?.(add), 150);
            setTimeout(() => setReadyToFlip(true), 1000);
        };

        const gradientStart = { x: 0, y: 0 };
        const gradientEnd = { x: 1, y: 1 };

        return (
            <View
                pointerEvents={flippable && suggestion ? 'auto' : 'none'}
                style={styles.container}
            >
                <FlipCard
                    flip={flip}
                    style={[styles.root, style]}
                    onFlipStart={() => handleFlip(true)}
                >
                    <LinearGradient
                        colors={[colors.cardAccent600, colors.cardAccent600]}
                        end={gradientEnd}
                        start={gradientStart}
                        style={styles.face}
                    >
                        <View style={styles.flagsContainer}>
                            <SquareFlag
                                languageCode={languageContext.mainLang}
                                style={styles.mainFlag}
                            />
                            <SquareFlag languageCode={languageContext.translationLang} />
                        </View>
                        <CustomText
                            numberOfLines={1}
                            style={[styles.word, !suggestion?.word && styles.inactiveWord]}
                            weight={'SemiBold'}
                        >
                            {suggestion?.word}
                        </CustomText>
                        <CustomText numberOfLines={1} style={styles.translation}>
                            {suggestion?.translation}
                        </CustomText>
                        <View style={styles.plusContainer}>
                            <Foundation color={colors.white} name={'plus'} size={12} />
                        </View>
                    </LinearGradient>
                    <LinearGradient
                        colors={[colors.green600, colors.green600]}
                        end={gradientEnd}
                        start={gradientStart}
                        style={styles.face}
                    >
                        <CustomText style={styles.successText} weight={'Bold'}>
                            {backText}
                        </CustomText>
                    </LinearGradient>
                </FlipCard>
            </View>
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        face: {
            backfaceVisibility: 'hidden',
            borderColor: colors.cardAccent300,
            borderRadius: 8,
            borderWidth: 2,
            flex: 1,
            justifyContent: 'center',
            overflow: 'hidden',
            padding: 12,
        },
        flag: {
            height: 30,
            marginRight: 4,
            width: 30,
        },
        flagsContainer: {
            flexDirection: 'row',
            marginBottom: 6,
        },
        inactiveWord: {
            backgroundColor: colors.primary600,
            opacity: 0.5,
        },
        mainFlag: {
            marginRight: 6,
        },
        plusContainer: {
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: 4,
            height: 22,
            justifyContent: 'center',
            position: 'absolute',
            right: 12,
            top: 12,
            width: 22,
        },
        root: {
            height: 86,
            overflow: 'hidden',
        },
        successText: {
            color: colors.background,
            fontSize: 14,
            textAlign: 'center',
        },
        translation: {
            color: colors.white300,
            fontSize: 11.5,
        },
        word: {
            color: colors.white,
            fontSize: 13.5,
        },
    });
