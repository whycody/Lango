import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '@react-navigation/native';

import { ExampleFlashcard } from '../../../types';
import { FlashcardSelectionItem } from '../../components/flashcards';
import { CustomTheme } from '../../Theme';

type FlashcardEntranceListProps = {
    onLastVisibleIndexChange?: (index: number) => void;
    onToggle: (id: string) => void;
    selectedIds: string[];
    flashcards: ExampleFlashcard[];
};

export const FlashcardEntranceList: FC<FlashcardEntranceListProps> = ({
    flashcards,
    onLastVisibleIndexChange,
    onToggle,
    selectedIds,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);

    const [itemAnims] = useState(() =>
        flashcards.map(() => ({
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

    const itemTopPositions = useRef<number[]>([]);
    const containerHeightRef = useRef(0);
    const scrollYRef = useRef(0);
    const onLastVisibleIndexChangeRef = useRef(onLastVisibleIndexChange);
    useEffect(() => {
        onLastVisibleIndexChangeRef.current = onLastVisibleIndexChange;
    }, [onLastVisibleIndexChange]);

    const computeAndReport = useCallback(() => {
        if (containerHeightRef.current === 0) return;
        const visibleBottom = scrollYRef.current + containerHeightRef.current;
        let lastVisible = -1;
        for (let i = 0; i < flashcards.length; i++) {
            if (
                itemTopPositions.current[i] !== undefined &&
                itemTopPositions.current[i] < visibleBottom
            ) {
                lastVisible = i;
            } else if (itemTopPositions.current[i] !== undefined) {
                break;
            }
        }
        onLastVisibleIndexChangeRef.current?.(lastVisible);
    }, [flashcards.length]);

    return (
        <ScrollView
            scrollEventThrottle={100}
            showsVerticalScrollIndicator={false}
            onLayout={e => {
                containerHeightRef.current = e.nativeEvent.layout.height;
                computeAndReport();
            }}
            onScroll={e => {
                scrollYRef.current = e.nativeEvent.contentOffset.y;
                computeAndReport();
            }}
        >
            {flashcards.map((item, i) => (
                <Animated.View
                    key={item.id}
                    style={{
                        opacity: itemAnims[i].opacity,
                        transform: [{ translateY: itemAnims[i].translateY }],
                    }}
                    onLayout={e => {
                        itemTopPositions.current[i] = e.nativeEvent.layout.y;
                        computeAndReport();
                    }}
                >
                    <FlashcardSelectionItem
                        flashcard={item}
                        selected={selectedIds.includes(item.id)}
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
