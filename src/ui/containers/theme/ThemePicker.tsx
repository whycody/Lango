import React, { useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AnalyticsEventName } from '../../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../../constants/margins';
import { THEME_OPTIONS } from '../../../constants/ThemeOptions';
import { AppTheme } from '../../../constants/UserPreferences';
import { useUserPreferences } from '../../../store';
import { trackEvent } from '../../../utils/analytics';
import { CustomText, Header } from '../../components';
import { CustomTheme } from '../../Theme';
import { themes } from '../../themes';

interface ThemePickerProps {
    onboarding?: boolean;
    style?: ViewStyle;
    title?: string;
    onThemeSelect?: (theme: AppTheme) => void;
}

export const ThemePicker = ({
    onThemeSelect,
    onboarding = false,
    style,
    title,
}: ThemePickerProps) => {
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, onboarding);
    const { t } = useTranslation();
    const { appTheme, setAppTheme } = useUserPreferences();

    const handlePress = useCallback(
        (theme: AppTheme) => {
            setAppTheme(theme);
            trackEvent(AnalyticsEventName.THEME_CHANGE, { theme });
            onThemeSelect?.(theme);
        },
        [setAppTheme, onThemeSelect],
    );

    const renderItem = useCallback(
        ({ item }: { item: (typeof THEME_OPTIONS)[number] }) => {
            const themeColors = themes[item.theme].colors;
            const isSelected = appTheme === item.theme;
            return (
                <Pressable
                    android_ripple={{ color: colors.background, foreground: true }}
                    onPress={() => handlePress(item.theme)}
                >
                    <View style={[styles.item, isSelected && { borderColor: colors.primary }]}>
                        <View style={[styles.colorDot, { backgroundColor: themeColors.primary }]} />
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
        [appTheme, colors, handlePress, t],
    );

    return (
        <View style={style}>
            <Header
                style={styles.header}
                subtitle={t('theme.desc')}
                title={title ?? t('theme.title')}
            />
            <FlatList
                data={THEME_OPTIONS}
                keyExtractor={item => item.theme}
                renderItem={renderItem}
                scrollEnabled={false}
                style={styles.list}
            />
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors'], onboarding: boolean) =>
    StyleSheet.create({
        colorDot: {
            borderRadius: 10,
            height: 20,
            width: 20,
        },
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
            backgroundColor: onboarding ? colors.card : colors.cardAccent,
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
            backgroundColor: onboarding ? colors.background : colors.card,
        },
    });
