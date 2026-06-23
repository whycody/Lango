import { memo, useCallback } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { GRADE_THREE_PROB_THRESHOLDS } from '../../../constants/Evaluation';
import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { getLevelColor } from '../../../utils/getLevelColor';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

type FlashcardListItemProps = {
    id: string;
    level: number;
    onEditPress?: (id: string) => void;
    onPress?: (id: string) => void;
    onRemovePress?: (id: string) => void;
    style?: StyleProp<ViewStyle>;
    text: string;
    translation: string;
    withContrast?: boolean;
};

export const FlashcardListItem = memo<FlashcardListItemProps>(
    ({
        id,
        level,
        onEditPress,
        onPress,
        onRemovePress,
        style,
        text,
        translation,
        withContrast = false,
    }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors, withContrast);

        const getColor = useCallback((level: number) => {
            return getLevelColor(level);
        }, []);

        const flashcardColor =
            level > GRADE_THREE_PROB_THRESHOLDS.GOOD_MIN
                ? colors.green
                : level > GRADE_THREE_PROB_THRESHOLDS.BAD_MAX
                  ? colors.yellow
                  : colors.red;

        return (
            <Pressable
                android_ripple={{ color: colors.cardAccent, foreground: true }}
                style={[styles.root, style]}
                onPress={() => onPress?.(id)}
            >
                <View style={[styles.container, { borderLeftColor: flashcardColor }]}>
                    <Ionicons color={getColor(level)} name={'reader'} size={22} />
                    <View style={styles.textContainer}>
                        <CustomText style={styles.text} weight={'SemiBold'}>
                            {text}
                        </CustomText>
                        <CustomText style={styles.translation}>{translation}</CustomText>
                    </View>
                    {onRemovePress && (
                        <Ionicons
                            color={colors.red}
                            name={'trash-outline'}
                            size={22}
                            style={styles.icon}
                            onPress={() => onRemovePress(id)}
                        />
                    )}
                    {onEditPress && (
                        <Ionicons
                            color={colors.white}
                            name={'pencil-outline'}
                            size={21}
                            style={styles.icon}
                            onPress={() => onEditPress(id)}
                        />
                    )}
                </View>
            </Pressable>
        );
    },
);

const getStyles = (colors: CustomTheme['colors'], withContrast: boolean) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            borderColor: colors.yellow,
            flexDirection: 'row',
            paddingLeft: MARGIN_HORIZONTAL,
            paddingRight: MARGIN_HORIZONTAL,
            paddingVertical: 13,
        },
        icon: {
            marginLeft: 10,
            opacity: 0.8,
            padding: 5,
            paddingRight: 0,
        },
        root: {
            backgroundColor: withContrast ? colors.cardAccent : colors.card,
            borderColor: withContrast ? colors.cardAccent300 : colors.cardAccent,
            borderRadius: spacing.m,
            borderWidth: 1,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 12,
            overflow: 'hidden',
        },
        text: {
            color: colors.white,
            fontSize: 14,
        },
        textContainer: {
            flex: 1,
            marginLeft: 10,
        },
        translation: {
            color: colors.white300,
            fontSize: 13,
        },
    });
