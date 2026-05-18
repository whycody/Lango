import React, { memo, useCallback } from 'react';
import { Pressable, StyleProp, StyleSheet, TextStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { SessionWord } from '../../../types';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

interface CardProps {
    frontSide?: boolean;
    onBackPress?: () => void;
    onContinuePress?: (id: string) => void;
    onEditPress?: (id: string) => void;
    onPlayAudio?: (word: SessionWord, frontSide: boolean) => void;
    text: string;
    example?: string | null;
    userHasEverSkippedSuggestion?: boolean;
    showTapSuggestion?: boolean;
    word?: SessionWord;
    wordIndex?: number;
    textStyle?: StyleProp<TextStyle>;
}

export const Card = memo<CardProps>(props => {
    const {
        example,
        frontSide = true,
        onBackPress,
        onContinuePress,
        onEditPress,
        onPlayAudio,
        showTapSuggestion,
        text,
        textStyle,
        userHasEverSkippedSuggestion,
        word,
        wordIndex,
    } = props;

    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const isSuggestion = word?.type === 'suggestion';
    const actionButtonIsActive =
        (!isSuggestion && onEditPress) || (isSuggestion && onContinuePress);

    const handleActionButtonPress = useCallback(() => {
        if (!isSuggestion && onEditPress && word?.id) {
            onEditPress(word.id);
        }

        if (isSuggestion && onContinuePress && word?.id) {
            onContinuePress(word.id);
        }
    }, [isSuggestion, word]);

    return (
        <>
            <LinearGradient
                colors={[colors.cardAccent300, colors.cardAccent]}
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
                            textStyle,
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
                            <Ionicons color={colors.white} name={'volume-high-sharp'} size={14} />
                        </Pressable>
                    )}
                    <View style={styles.tagsContainer}>
                        {word?.tags?.map(tag => (
                            <CustomText key={tag} style={styles.tag} weight={'SemiBold'}>
                                {t(`word_tags.${tag}`)}
                            </CustomText>
                        ))}
                    </View>
                    {example && <CustomText style={styles.exampleText}>{example}</CustomText>}
                </View>
                <View style={styles.cardIconsContainer}>
                    <Ionicons
                        color={colors.white}
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
                        color={colors.white}
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

            {showTapSuggestion && (
                <LottieView
                    autoPlay={showTapSuggestion}
                    loop={showTapSuggestion}
                    source={require('../../../../assets/tap.json')}
                    style={styles.lottie}
                />
            )}
        </>
    );
});

const getStyles = (colors: CustomTheme['colors']) =>
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
        exampleText: {
            color: colors.white300,
            fontSize: 12,
            height: 30,
            marginHorizontal: MARGIN_HORIZONTAL,
            textAlign: 'center',
        },
        icon: {
            padding: MARGIN_HORIZONTAL,
            zIndex: 2,
        },
        iconMarked: {
            backgroundColor: colors.cardAccent300,
            borderRadius: 50,
            margin: MARGIN_HORIZONTAL / 2,
            padding: MARGIN_HORIZONTAL / 2,
        },
        longText: {
            marginTop: MARGIN_VERTICAL * 3,
            textAlign: 'left',
        },
        lottie: {
            bottom: 0,
            height: '60%',
            opacity: 0.3,
            pointerEvents: 'none',
            position: 'absolute',
            right: 0,
            width: '60%',
            zIndex: 1,
        },
        newWordSuggestion: {
            backgroundColor: colors.primary,
            borderColor: colors.primary800,
            borderLeftWidth: 2,
            borderRightWidth: 2,
            color: colors.white,
            fontSize: 12.5,
            left: -1.5,
            paddingVertical: 3,
            position: 'absolute',
            right: -1.5,
            textAlign: 'center',
            top: 25,
        },
        playButton: {
            alignItems: 'center',
            alignSelf: 'center',
            backgroundColor: colors.primary,
            borderRadius: spacing.xs,
            flexDirection: 'row',
            gap: 6,
            marginVertical: 10,
            opacity: 0.8,
            padding: 4,
            paddingHorizontal: 12,
            zIndex: 2,
        },
        playText: {
            color: colors.white,
            fontSize: 11,
        },
        root: {
            backgroundColor: colors.cardAccent300,
            borderColor: colors.cardAccent,
            borderRadius: spacing.l,
            borderWidth: 2,
            flex: 1,
        },
        skipSuggestionText: {
            color: colors.white300,
            flex: 1,
            fontSize: 10,
            marginBottom: 4,
            textAlign: 'center',
        },
        tag: {
            backgroundColor: colors.cardAccent300,
            borderRadius: spacing.xs,
            color: colors.white300,
            fontSize: 9,
            height: 18,
            paddingHorizontal: 5,
            textAlignVertical: 'center',
        },
        tagsContainer: {
            alignSelf: 'center',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center',
            width: '75%',
        },
        text: {
            color: colors.white,
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
