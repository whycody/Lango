import React, { FC, useEffect, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { ExampleFlashcard } from '../../../types';
import { FlashcardSelectionItem } from '../../components/flashcards';
import { CustomTheme } from '../../Theme';

type FlashcardEntranceListProps = {
    onToggle: (id: string) => void;
    selectedIds: string[];
    words: ExampleFlashcard[];
};

export const FlashcardEntranceList: FC<FlashcardEntranceListProps> = ({
    onToggle,
    selectedIds,
    words,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    const [itemAnims] = useState(() =>
        words.map(() => ({
            opacity: new Animated.Value(0),
            translateY: new Animated.Value(-20),
        })),
    );

    useEffect(() => {
        const animations = itemAnims.map(({ opacity, translateY }, i) =>
            Animated.sequence([
                Animated.delay(i * 50),
                Animated.parallel([
                    Animated.timing(opacity, { duration: 200, toValue: 1, useNativeDriver: true }),
                    Animated.timing(translateY, {
                        duration: 200,
                        toValue: 0,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        );
        Animated.parallel(animations).start();
        return () => animations.forEach(a => a.stop());
    }, []);

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {words.map((item, i) => (
                <Animated.View
                    key={item.id}
                    style={{
                        opacity: itemAnims[i].opacity,
                        transform: [{ translateY: itemAnims[i].translateY }],
                    }}
                >
                    <FlashcardSelectionItem
                        selected={selectedIds.includes(item.id)}
                        word={item}
                        onToggle={onToggle}
                    />
                    <View style={styles.divider} />
                </Animated.View>
            ))}
        </ScrollView>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        divider: {
            backgroundColor: colors.background,
            height: 3,
            width: '100%',
        },
    });
