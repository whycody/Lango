import React, { FC } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { LANGUAGE_LEVEL_KEYS } from '../../../constants/Language';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { useAuth, useLanguage } from '../../../store';
import { Language, LanguageLevelRange } from '../../../types';
import { Header } from '../../components';
import { LanguageLevelItem } from '../../components/language';
import { CustomTheme } from '../../Theme';

type LanguageLevelPickerProps = {
    language?: Language;
    onLevelPick?: (level: LanguageLevelRange) => void;
    pickedLevel?: LanguageLevelRange;
    style?: StyleProp<ViewStyle>;
    title?: string;
    updateUserData?: boolean;
    onboarding?: boolean;
};

export const LanguageLevelPicker: FC<LanguageLevelPickerProps> = ({
    language,
    onLevelPick,
    onboarding = false,
    pickedLevel,
    style,
    title,
    updateUserData = true,
}) => {
    const { t } = useTranslation();
    const { setMainLang } = useLanguage();
    const { updateUserLanguageLevels } = useAuth();
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, onboarding);
    const haptics = useHaptics();

    const languageLevels = LANGUAGE_LEVEL_KEYS.map(l => ({
        code: l.code,
        desc: t(`language_level.${l.key}_desc`),
        label: t(`language_level.${l.key}`),
        level: l.level,
    }));

    const handleLanguageLevelPress = (level: LanguageLevelRange) => {
        onLevelPick?.(level);
        haptics.triggerHaptics('rigid');
        if (!updateUserData || !language) return;
        updateUserLanguageLevels({ language: language.languageCode, level });
        setMainLang(language.languageCode);
    };

    return (
        <View style={style}>
            <Header
                style={styles.header}
                subtitle={t('language_level.select_desc')}
                title={
                    title ??
                    t('language_level.select', {
                        language: language?.languageName.toLowerCase(),
                    })
                }
            />
            <View style={styles.list}>
                {languageLevels.map(({ code, desc, label, level }) => (
                    <LanguageLevelItem
                        key={level}
                        code={code}
                        desc={desc}
                        label={label}
                        level={level}
                        onboarding={onboarding}
                        picked={level == pickedLevel}
                        onPress={handleLanguageLevelPress}
                    />
                ))}
            </View>
        </View>
    );
};

const getStyles = (colors: CustomTheme['colors'], onboarding: boolean) =>
    StyleSheet.create({
        header: {
            paddingBottom: 16,
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingTop: MARGIN_VERTICAL / 2,
        },
        list: {
            backgroundColor: onboarding ? colors.background : colors.card,
            flex: onboarding ? 1 : undefined,
        },
    });
