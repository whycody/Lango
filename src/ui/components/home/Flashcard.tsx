import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Foundation } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AnalyticsEventName } from '../../../constants/AnalyticsEventName';
import { spacing } from '../../../constants/margins';
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
        const styles = useMemo(() => getStyles(colors), [colors]);
        const { t } = useTranslation();
        const wordsContext = useWords();
        const languageContext = useLanguage();
        const { triggerHaptics } = useHaptics();

        const getRandomMessage = useCallback(() => {
            const messages = [t('wordAdded1'), t('wordAdded2'), t('wordAdded3')];
            return messages[Math.floor(Math.random() * messages.length)];
        }, [t]);

        const [backText, setBackText] = useState(() => getRandomMessage());
        const [flashcardState, setFlashcardState] = useState<'success' | 'error' | 'neutral'>(
            'neutral',
        );

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
        }, [newFlashcardIsReady, readyToFlip, getRandomMessage]);

        const handleFlip = useCallback(
            (add: boolean = true) => {
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
                    if (!addWord) {
                        setBackText(t('wordNotAdded'));
                        setFlashcardState('error');
                    } else setFlashcardState('success');
                } else {
                    setBackText(t('change_flashcard'));
                    setFlashcardState('neutral');
                }
                setTimeout(() => onFlashcardPress?.(add), 150);
                setTimeout(() => setReadyToFlip(true), 1000);
            },
            [flippable, suggestion, wordsContext, triggerHaptics, t, onFlashcardPress],
        );

        useImperativeHandle(
            ref,
            () => ({
                flippable: readyToFlip,
                flipWithoutAdd: () => handleFlip(false),
            }),
            [readyToFlip, handleFlip],
        );

        return (
            <View
                pointerEvents={flippable && suggestion ? 'auto' : 'none'}
                style={styles.container}
            >
                <FlipCard
                    flip={flip}
                    flipVertical={true}
                    style={[styles.root, style]}
                    swipeable={false}
                    onFlipStart={() => handleFlip(true)}
                >
                    <View style={styles.face}>
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
                    </View>
                    <View
                        style={[
                            styles.face,
                            {
                                backgroundColor:
                                    flashcardState === 'success'
                                        ? colors.green
                                        : flashcardState === 'error'
                                          ? colors.red
                                          : colors.cardAccent600,
                            },
                        ]}
                    >
                        <CustomText
                            weight={'Bold'}
                            style={[
                                styles.successText,
                                flashcardState === 'neutral' && { color: colors.white },
                            ]}
                        >
                            {backText}
                        </CustomText>
                    </View>
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
            backgroundColor: colors.cardAccent600,
            borderColor: colors.cardAccent300,
            borderRadius: spacing.m,
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
            borderRadius: spacing.xs,
            opacity: 0.5,
        },
        mainFlag: {
            marginRight: 6,
        },
        plusContainer: {
            alignItems: 'center',
            backgroundColor: colors.card,
            borderRadius: spacing.s,
            height: 20,
            justifyContent: 'center',
            position: 'absolute',
            right: 11,
            top: 11,
            width: 20,
        },
        root: {
            height: 80,
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
