import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { BUNDLE_VISIBILITY_OPTIONS } from '../../../constants/WordsBundle';
import { WordsBundleVisibility } from '../../../types';
import { CustomText, Header } from '../../components';
import { CustomTheme } from '../../Theme';

interface VisibilityPickerProps {
    style?: ViewStyle;
    value: WordsBundleVisibility;
    onSelect: (visibility: WordsBundleVisibility) => void;
}

export const VisibilityPicker = ({ onSelect, style, value }: VisibilityPickerProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
    const { t } = useTranslation();

    const renderItem = useCallback(
        ({ item }: { item: (typeof BUNDLE_VISIBILITY_OPTIONS)[number] }) => {
            const isSelected = value === item.visibility;
            return (
                <Pressable
                    android_ripple={{ color: colors.background, foreground: true }}
                    onPress={() => onSelect(item.visibility)}
                >
                    <View style={[styles.item, isSelected && { borderColor: colors.primary }]}>
                        <Ionicons color={colors.primary300} name={item.icon} size={20} />
                        <View style={styles.labelContainer}>
                            <CustomText style={styles.label} weight="SemiBold">
                                {t(item.labelKey)}
                            </CustomText>
                            <CustomText style={styles.desc}>{t(item.descKey)}</CustomText>
                        </View>
                    </View>
                </Pressable>
            );
        },
        [colors, onSelect, styles, t, value],
    );

    return (
        <View style={style}>
            <Header
                style={styles.header}
                subtitle={t('bundle_details.visibility.desc')}
                title={t('bundle_details.visibility.title')}
            />
            <FlatList
                data={BUNDLE_VISIBILITY_OPTIONS}
                keyExtractor={item => item.visibility}
                renderItem={renderItem}
                scrollEnabled={false}
                style={styles.list}
            />
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        desc: {
            color: colors.white600,
            fontSize: 12,
            marginTop: 2,
        },
        header: {
            paddingBottom: 16,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL / 2,
        },
        item: {
            alignItems: 'center',
            backgroundColor: colors.cardAccent,
            borderColor: colors.cardAccent300,
            borderRadius: spacing.m,
            borderWidth: 1,
            flexDirection: 'row',
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 12,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 12,
        },
        label: {
            color: colors.white,
            fontSize: 14,
        },
        labelContainer: {
            marginLeft: 12,
        },
        list: {
            backgroundColor: colors.card,
        },
    });
