import React, { memo, useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { SessionWord } from '../../../types';
import { CustomText } from '..';

interface CardProps {
    frontSide?: boolean;
    onBackPress?: () => void;
    onContinuePress?: (id: string) => void;
    onEditPress?: (id: string) => void;
    onPlayAudio?: (word: SessionWord, frontSide: boolean) => void;
    text: string;
    userHasEverSkippedSuggestion?: boolean;
    word?: SessionWord;
    wordIndex?: number;
}

export const Card = memo<CardProps>(props => {
    const {
        frontSide = true,
        onBackPress,
        onContinuePress,
        onEditPress,
        onPlayAudio,
        text,
        userHasEverSkippedSuggestion,
        word,
        wordIndex,
    } = props;

    const { colors } = useTheme();
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const isSuggestion = word?.type === 'suggestion';
    const actionButtonIsActive =
        (!isSuggestion && onEditPress) || (isSuggestion && onContinuePress);

    const handleActionButtonPress = useCallback(() => {
        if (!isSuggestion && onEditPress) {
            onEditPress(word.id);
        }

        if (isSuggestion && onContinuePress) {
            onContinuePress(word.id);
        }
    }, [isSuggestion, word]);

    return (
        <LinearGradient
            colors={[colors.cardAccent, colors.cardAccent600]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.root}
        >
            {isSuggestion && (
                <CustomText style={styles.newWordSuggestion} weight={'Bold'}>
                    {t('new_word_suggestion')}
                </CustomText>
            )}
            <View style={styles.textContainer}>
                <CustomText
                    adjustsFontSizeToFit
                    weight={'SemiBold'}
                    style={[
                        styles.text,
                        text.length > 300 && styles.longText,
                        !word && styles.exampleFlashcardText,
                    ]}
                >
                    {text}
                </CustomText>
                {onPlayAudio && word && (
                    <Pressable
                        style={styles.playButton}
                        onPress={() => onPlayAudio(word, frontSide)}
                    >
                        <CustomText style={styles.playText} weight={'SemiBold'}>
                            {t('play')}
                        </CustomText>
                        <Ionicons color={colors.primary300} name={'volume-high-sharp'} size={14} />
                    </Pressable>
                )}
                <View style={styles.tagsContainer}>
                    {word?.tags?.map(tag => (
                        <CustomText key={tag} style={styles.tag} weight={'SemiBold'}>
                            {t(`word_tags.${tag}`)}
                        </CustomText>
                    ))}
                </View>
            </View>
            <View style={styles.cardIconsContainer}>
                <Ionicons
                    color={colors.primary300}
                    name={'arrow-back-sharp'}
                    size={24}
                    style={[styles.icon, { opacity: wordIndex != 0 && onBackPress ? 1 : 0.4 }]}
                    onPress={() => wordIndex != 0 && onBackPress && onBackPress()}
                />
                {!userHasEverSkippedSuggestion && isSuggestion && (
                    <CustomText style={styles.skipSuggestionText} weight={'SemiBold'}>
                        {t('press_arrow_to_skip_suggestion')}
                    </CustomText>
                )}
                <Ionicons
                    color={colors.primary300}
                    name={isSuggestion ? 'arrow-forward-sharp' : 'pencil-sharp'}
                    size={24}
                    style={[
                        styles.icon,
                        { opacity: actionButtonIsActive ? 1 : 0.4 },
                        isSuggestion && !userHasEverSkippedSuggestion && styles.iconMarked,
                    ]}
                    onPress={handleActionButtonPress}
                />
            </View>
        </LinearGradient>
    );
});

const getStyles = (colors: any) =>
    StyleSheet.create({
        cardIconsContainer: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
        },
        exampleFlashcardText: {
            marginTop: MARGIN_VERTICAL * 2,
        },
        icon: {
            margin: MARGIN_HORIZONTAL / 2,
            padding: MARGIN_HORIZONTAL / 2,
        },
        iconMarked: {
            backgroundColor: colors.cardAccent,
            borderRadius: 50,
        },
        longText: {
            marginTop: MARGIN_VERTICAL * 3,
            textAlign: 'left',
        },
        newWordSuggestion: {
            backgroundColor: colors.primary,
            color: colors.cardAccent300,
            fontSize: 12.5,
            left: -1.5,
            position: 'absolute',
            right: -1.5,
            textAlign: 'center',
            top: 20,
        },
        playButton: {
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: colors.cardAccent600,
            flexDirection: 'row',
            gap: 6,
            marginVertical: 10,
            opacity: 0.8,
            padding: 4,
            paddingHorizontal: 12,
        },
        playText: {
            color: colors.primary300,
            fontSize: 11,
        },
        root: {
            backgroundColor: colors.cardAccent300,
            flex: 1,
        },
        skipSuggestionText: {
            color: colors.cardAccent,
            flex: 1,
            fontSize: 10,
            marginBottom: 4,
            textAlign: 'center',
        },
        tag: {
            backgroundColor: colors.cardAccent,
            color: colors.primary600,
            fontSize: 9,
            paddingHorizontal: 5,
            paddingVertical: 1,
        },
        tagsContainer: {
            alignSelf: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center',
            opacity: 0.6,
            width: '75%',
        },
        text: {
            color: colors.primary,
            fontSize: 25,
            marginHorizontal: MARGIN_HORIZONTAL * 2,
            marginTop: MARGIN_VERTICAL * 4,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        textContainer: {
            flex: 1,
            justifyContent: 'center',
        },
    });
