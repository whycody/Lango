import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { AnalyticsEventName } from '../../constants/AnalyticsEventName';
import { MARGIN_HORIZONTAL, spacing } from '../../constants/margins';
import { AppTheme } from '../../constants/UserPreferences';
import { useUserPreferences } from '../../store';
import { trackEvent } from '../../utils/analytics';
import { CustomText } from '../components';
import { CustomTheme } from '../Theme';
import { themes } from '../themes';
import { GenericBottomSheet } from './GenericBottomSheet';

type ThemeBottomSheetProps = {
    sheetName: string;
};

const THEME_OPTIONS: { descKey: string; labelKey: string; theme: AppTheme }[] = [
    { descKey: 'theme.blue_desc', labelKey: 'theme.blue', theme: AppTheme.BLUE },
    { descKey: 'theme.green_desc', labelKey: 'theme.green', theme: AppTheme.GREEN },
    { descKey: 'theme.pink_desc', labelKey: 'theme.pink', theme: AppTheme.PINK },
    { descKey: 'theme.red_desc', labelKey: 'theme.red', theme: AppTheme.RED },
    { descKey: 'theme.orange_desc', labelKey: 'theme.orange', theme: AppTheme.ORANGE },
    { descKey: 'theme.purple_desc', labelKey: 'theme.purple', theme: AppTheme.PURPLE },
];

export const ThemeBottomSheet = ({ sheetName }: ThemeBottomSheetProps) => {
    const { t } = useTranslation();
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors);
    const { appTheme, setAppTheme } = useUserPreferences();

    const handlePress = useCallback(
        (theme: AppTheme) => {
            setAppTheme(theme);
            trackEvent(AnalyticsEventName.THEME_CHANGE, { theme });
            TrueSheet.dismiss(sheetName);
        },
        [sheetName, setAppTheme],
    );

    return (
        <GenericBottomSheet
            description={t('theme.desc')}
            primaryActionLabel={t('cancel')}
            sheetName={sheetName}
            style={styles.sheet}
            title={t('theme.title')}
            onPrimaryButtonPress={() => TrueSheet.dismiss(sheetName)}
        >
            {THEME_OPTIONS.map(({ descKey, labelKey, theme }) => {
                const themeColors = themes[theme].colors;
                const isSelected = appTheme === theme;
                return (
                    <Pressable
                        key={theme}
                        android_ripple={{ color: colors.background, foreground: true }}
                        onPress={() => handlePress(theme)}
                    >
                        <View style={[styles.item, isSelected && { borderColor: colors.primary }]}>
                            <View
                                style={[styles.colorDot, { backgroundColor: themeColors.primary }]}
                            />
                            <View style={styles.labelContainer}>
                                <CustomText style={styles.label} weight="SemiBold">
                                    {t(labelKey)}
                                </CustomText>
                                <CustomText style={styles.desc}>{t(descKey)}</CustomText>
                            </View>
                        </View>
                    </Pressable>
                );
            })}
        </GenericBottomSheet>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
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
            paddingVertical: 15,
        },
        label: {
            color: colors.white,
            fontSize: 14,
        },
        labelContainer: {
            marginLeft: 12,
        },
        sheet: {
            marginTop: 10,
        },
    });
