import { memo, useCallback } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

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
    index: number;
};

export const FlashcardListItem = memo<FlashcardListItemProps>(
    ({ id, index, level, onEditPress, onPress, onRemovePress, style, text, translation }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors, index);

        const getColor = useCallback((level: number) => {
            return getLevelColor(level);
        }, []);

        return (
            <Pressable
                android_ripple={{ color: colors.card, foreground: true }}
                style={[styles.root, style]}
                onPress={() => onPress?.(id)}
            >
                <View style={styles.container}>
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
                            name={'trash'}
                            size={22}
                            style={styles.icon}
                            onPress={() => onRemovePress(id)}
                        />
                    )}
                    {onEditPress && (
                        <Ionicons
                            color={colors.white}
                            name={'pencil'}
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

const getStyles = (colors: CustomTheme['colors'], index: number) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 12,
        },
        icon: {
            marginLeft: 10,
            opacity: 0.8,
            padding: 5,
            paddingRight: 0,
        },
        root: {
            backgroundColor: colors.card,
            borderColor: colors.card,
            borderRadius: spacing.m,
            borderTopWidth: 3,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: index !== 0 ? 12 : 0,
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
