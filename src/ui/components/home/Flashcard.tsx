import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Foundation } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import FlipCard from 'react-native-flip-card';

import { AnalyticsEventName } from '../../../constants/AnalyticsEventName';
import { useHaptics } from '../../../hooks';
import { useLanguage, useWords, WordSource } from '../../../store';
import { Suggestion } from '../../../types';
import { trackEvent } from '../../../utils/analytics';
import { CustomText, SquareFlag } from '..';

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
        const { colors } = useTheme();
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
            setFlip(prevState => !prevState);
            setTimeout(() => {
                setBackText(getRandomMessage());
                setFlippable(true);
            }, 200);
        }, [setNewFlashcardIsReady, newFlashcardIsReady, readyToFlip]);

        const handleFlip = async (add: boolean = true) => {
            if (!flippable) return;
            if (!add) setFlip(prev => !prev);
            setFlippable(false);
            setNewFlashcardIsReady(false);
            await triggerHaptics(Haptics.ImpactFeedbackStyle.Rigid);
            if (add) {
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
            setTimeout(() => onFlashcardPress(add), 150);
            setTimeout(() => setReadyToFlip(true), 1000);
        };

        return (
            <View
                pointerEvents={flippable && suggestion ? 'auto' : 'none'}
                style={styles.container}
            >
                <FlipCard flip={flip} onFlipStart={() => handleFlip(true)}>
                    <LinearGradient
                        colors={[colors.cardAccent, colors.cardAccent600]}
                        end={{ x: 1, y: 1 }}
                        start={{ x: 0, y: 0 }}
                        style={[styles.root, style]}
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
                            weight={'SemiBold'}
                            style={[
                                styles.word,
                                !suggestion?.word && {
                                    backgroundColor: colors.primary600,
                                    opacity: 0.5,
                                },
                            ]}
                        >
                            {suggestion?.word}
                        </CustomText>
                        <CustomText numberOfLines={1} style={styles.translation}>
                            {suggestion?.translation}
                        </CustomText>
                        <View style={styles.plusContainer}>
                            <Foundation color={colors.primary} name={'plus'} size={12} />
                        </View>
                    </LinearGradient>
                    <LinearGradient
                        colors={[colors.cardAccent, colors.cardAccent600]}
                        end={{ x: 1, y: 1 }}
                        start={{ x: 0, y: 0 }}
                        style={[styles.root, style, { justifyContent: 'center' }]}
                    >
                        <CustomText style={styles.successText} weight={'SemiBold'}>
                            {backText}
                        </CustomText>
                    </LinearGradient>
                </FlipCard>
            </View>
        );
    },
);

const getStyles = (colors: any) =>
    StyleSheet.create({
        container: {
            flex: 1,
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
        mainFlag: {
            marginRight: 6,
        },
        plusContainer: {
            alignItems: 'center',
            backgroundColor: colors.card,
            height: 22,
            justifyContent: 'center',
            position: 'absolute',
            right: 12,
            top: 12,
            width: 22,
        },
        root: {
            backgroundColor: colors.cardAccent,
            height: 86,
            padding: 12,
        },
        successText: {
            color: colors.primary300,
            fontSize: 14,
            textAlign: 'center',
        },
        translation: {
            color: colors.primary300,
            fontSize: 12,
            opacity: 0.8,
        },
        word: {
            color: colors.primary300,
            fontSize: 14,
        },
    });
