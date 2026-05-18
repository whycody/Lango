import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

import { MARGIN_HORIZONTAL, spacing } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { ExampleFlashcard } from '../../../types';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

type FlashcardSelectionItemProps = {
    onToggle: (id: string) => void;
    selected: boolean;
    flashcard: ExampleFlashcard;
    color: string;
};

export const FlashcardSelectionItem = memo<FlashcardSelectionItemProps>(
    ({ color, flashcard, onToggle, selected }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);
        const haptics = useHaptics();

        const handleToggle = () => {
            onToggle(flashcard.id);
            haptics.triggerHaptics('light');
        };

        return (
            <Pressable
                android_ripple={{ color: colors.background, foreground: true }}
                onPress={handleToggle}
            >
                <View style={styles.container}>
                    <Ionicons color={color} name={'reader'} size={22} />
                    <View style={styles.textContainer}>
                        <CustomText style={styles.text} weight={'SemiBold'}>
                            {flashcard.word}
                        </CustomText>
                        <CustomText style={styles.translation}>{flashcard.translation}</CustomText>
                    </View>
                    <View style={styles.checkboxContainer}>
                        {selected ? (
                            <Ionicons color={colors.primary} name={'checkbox'} size={24} />
                        ) : (
                            <View style={styles.uncheckedBox} />
                        )}
                    </View>
                </View>
            </Pressable>
        );
    },
);

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        checkboxContainer: {
            alignItems: 'center',
            height: 24,
            justifyContent: 'center',
            marginLeft: 10,
            width: 24,
        },
        container: {
            alignItems: 'center',
            backgroundColor: colors.card,
            borderColor: colors.cardAccent,
            borderRadius: spacing.m,
            borderWidth: 1,
            flexDirection: 'row',
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 12,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 12,
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
        uncheckedBox: {
            borderColor: colors.cardAccent300,
            borderRadius: spacing.s,
            borderWidth: 2,
            height: 20,
            width: 20,
        },
    });
