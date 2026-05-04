import React, { FC, useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { ExampleFlashcard } from '../../../types';
import { CustomText, Header } from '../../components';
import { CustomTheme } from '../../Theme';
import { FlashcardEntranceList } from './FlashcardEntranceList';
import { FlashcardsSelectionSkeleton } from './FlashcardsSelectionSkeleton';

type FlashcardsSelectionContainerProps = {
    loading?: boolean;
    onSelectAll: (ids: string[]) => void;
    onToggle: (id: string) => void;
    selectedIds: string[];
    style?: StyleProp<ViewStyle>;
    title?: string;
    words: ExampleFlashcard[];
};

export const FlashcardsSelectionContainer: FC<FlashcardsSelectionContainerProps> = ({
    loading,
    onSelectAll,
    onToggle,
    selectedIds,
    style,
    title,
    words,
}) => {
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);
    const haptics = useHaptics();

    const [showSkeleton, setShowSkeleton] = useState(!!loading);
    const skeletonOpacity = useRef(new Animated.Value(loading ? 1 : 0)).current;

    useEffect(() => {
        if (loading) {
            setShowSkeleton(true);
            skeletonOpacity.setValue(1);
        } else if (showSkeleton) {
            Animated.timing(skeletonOpacity, {
                duration: 200,
                toValue: 0,
                useNativeDriver: true,
            }).start(({ finished }) => {
                if (finished) setShowSkeleton(false);
            });
        }
    }, [loading]);

    const allSelected = words.length > 0 && selectedIds.length === words.length;

    const handleSelectAll = () => {
        haptics.triggerHaptics('rigid');
        if (allSelected) {
            onSelectAll([]);
            return;
        }
        onSelectAll(words.map(w => w.id));
    };

    return (
        <View style={[styles.root, style]}>
            <Header
                style={styles.header}
                subtitle={t('word_selection.desc')}
                title={title ?? t('word_selection.title')}
            />
            <Pressable
                android_ripple={{ color: colors.background, foreground: true }}
                disabled={loading}
                style={styles.selectAllRow}
                onPress={handleSelectAll}
            >
                <CustomText style={styles.selectAllText} weight={'SemiBold'}>
                    {t('word_selection.select_all')}
                </CustomText>
                <View style={styles.checkboxContainer}>
                    {allSelected ? (
                        <Ionicons color={colors.primary300} name={'checkbox-sharp'} size={24} />
                    ) : (
                        <View style={styles.uncheckedBox} />
                    )}
                </View>
            </Pressable>
            <View style={styles.divider} />
            {showSkeleton ? (
                <Animated.View style={{ opacity: skeletonOpacity }}>
                    <FlashcardsSelectionSkeleton />
                </Animated.View>
            ) : (
                <FlashcardEntranceList
                    selectedIds={selectedIds}
                    words={words}
                    onToggle={onToggle}
                />
            )}
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        checkboxContainer: {
            alignItems: 'center',
            height: 24,
            justifyContent: 'center',
            width: 24,
        },
        divider: {
            backgroundColor: colors.background,
            height: 3,
            width: '100%',
        },
        header: {
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL / 2,
        },
        root: {
            flex: 1,
        },
        selectAllRow: {
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 12,
        },
        selectAllText: {
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
