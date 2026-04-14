import { memo, useCallback } from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
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
};

export const FlashcardListItem = memo<FlashcardListItemProps>(
    ({ id, level, onEditPress, onPress, onRemovePress, style, text, translation }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);

        const getColor = useCallback((level: number) => {
            return getLevelColor(level);
        }, []);

        return (
            <Pressable
                android_ripple={{ color: 'red' }}
                style={[styles.root, style]}
                onPress={() => onPress?.(id)}
            >
                <View style={styles.container}>
                    <Ionicons color={getColor(level)} name={'reader-sharp'} size={22} />
                    <View style={styles.textContainer}>
                        <CustomText style={styles.text} weight={'SemiBold'}>
                            {text}
                        </CustomText>
                        <CustomText style={styles.translation}>{translation}</CustomText>
                    </View>
                    {onRemovePress && (
                        <Ionicons
                            color={colors.primary600}
                            name={'trash-sharp'}
                            size={22}
                            style={styles.icon}
                            onPress={() => onRemovePress(id)}
                        />
                    )}
                    {onEditPress && (
                        <Ionicons
                            color={colors.primary300}
                            name={'pencil-sharp'}
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

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        container: {
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 15,
        },
        icon: {
            marginLeft: 10,
            opacity: 0.8,
            padding: 5,
            paddingRight: 0,
        },
        root: {
            backgroundColor: colors.background,
            borderColor: colors.card,
            borderTopWidth: 3,
        },
        text: {
            color: colors.primary,
            fontSize: 14,
        },
        textContainer: {
            flex: 1,
            marginLeft: 10,
        },
        translation: {
            color: colors.primary300,
            fontSize: 13,
        },
    });
