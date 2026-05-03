import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { MARGIN_HORIZONTAL } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { ExampleFlashcard } from '../../../types';
import { CustomTheme } from '../../Theme';
import { CustomText } from '..';

type FlashcardSelectionItemProps = {
    onToggle: (id: string) => void;
    selected: boolean;
    word: ExampleFlashcard;
};

export const FlashcardSelectionItem = memo<FlashcardSelectionItemProps>(
    ({ onToggle, selected, word }) => {
        const { colors } = useTheme() as CustomTheme;
        const styles = getStyles(colors);
        const haptics = useHaptics();

        const handleToggle = () => {
            onToggle(word.id);
            haptics.triggerHaptics('light');
        };

        return (
            <Pressable
                android_ripple={{ color: colors.background, foreground: true }}
                onPress={handleToggle}
            >
                <LinearGradient
                    colors={['transparent', selected ? colors.cardAccent : 'transparent']}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                >
                    <View style={styles.container}>
                        <Ionicons color={colors.primary600} name={'reader-sharp'} size={22} />
                        <View style={styles.textContainer}>
                            <CustomText style={styles.text} weight={'SemiBold'}>
                                {word.word}
                            </CustomText>
                            <CustomText style={styles.translation}>{word.translation}</CustomText>
                        </View>
                        <View style={styles.checkboxContainer}>
                            {selected ? (
                                <Ionicons
                                    color={colors.primary}
                                    name={'checkbox-sharp'}
                                    size={24}
                                />
                            ) : (
                                <View style={styles.uncheckedBox} />
                            )}
                        </View>
                    </View>
                </LinearGradient>
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
            flexDirection: 'row',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 15,
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
        uncheckedBox: {
            borderColor: colors.cardAccent300,
            borderWidth: 2,
            height: 20,
            width: 20,
        },
    });
