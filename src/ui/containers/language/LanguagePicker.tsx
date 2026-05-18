import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { LanguageCode, LanguageTypes } from '../../../constants/Language';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { useAuth, useLanguage } from '../../../store';
import { Language } from '../../../types';
import { Header } from '../../components';
import { LanguageItem } from '../../components/language';
import { CustomTheme } from '../../Theme';

interface LanguagePickerProps {
    allLanguages?: boolean;
    alwaysAllowPick?: boolean;
    languageType?: LanguageTypes;
    onLanguagePick?: (
        language: Language,
        mainLangNeedsEvaluation: boolean,
        translationLangNeedsMainLangEvaluation: boolean,
    ) => void;
    style?: ViewStyle;
    title?: string;
    onboarding?: boolean;
}

export const LanguagePicker = (props: LanguagePickerProps) => {
    const {
        allLanguages = true,
        alwaysAllowPick,
        languageType = LanguageTypes.MAIN,
        onLanguagePick,
        onboarding = false,
        style,
        title,
    } = props;
    const { colors } = useTheme() as CustomTheme;
    const styles = getStyles(colors, onboarding);
    const { t } = useTranslation();
    const {
        applicationLang,
        languages,
        mainLang,
        setApplicationLang,
        setMainLang,
        setTranslationLang,
        translationLang,
    } = useLanguage();
    const { user } = useAuth();
    const { triggerHaptics } = useHaptics();

    const pickedLanguage =
        languageType === LanguageTypes.MAIN
            ? mainLang
            : languageType === LanguageTypes.TRANSLATION
              ? translationLang
              : applicationLang;

    const langTypeDesc =
        languageType === LanguageTypes.MAIN
            ? 'main'
            : languageType === LanguageTypes.TRANSLATION
              ? 'translation'
              : 'application';

    const mainLanguagesData = allLanguages
        ? languages
        : languages.filter(lang => lang.languageCode !== translationLang);

    const translationLanguagesData = allLanguages
        ? languages
        : languages.filter(lang => lang.languageCode !== mainLang);

    const appLanguagesData = languages.filter(lang =>
        [
            LanguageCode.POLISH,
            LanguageCode.ENGLISH,
            LanguageCode.SPANISH,
            LanguageCode.ITALIAN,
        ].includes(lang.languageCode),
    );

    const languagesData =
        languageType == LanguageTypes.MAIN
            ? mainLanguagesData
            : languageType === LanguageTypes.TRANSLATION
              ? translationLanguagesData
              : appLanguagesData;

    const handleLanguagePick = useCallback(
        (language: Language) => {
            const setters: Record<LanguageTypes, (code: LanguageCode) => void> = {
                [LanguageTypes.MAIN]: setMainLang,
                [LanguageTypes.TRANSLATION]: setTranslationLang,
                [LanguageTypes.APPLICATION]: setApplicationLang,
            };

            const translationLangNeedsMainLangEvaluation =
                languageType === LanguageTypes.TRANSLATION &&
                mainLang !== language.languageCode &&
                !user?.languageLevels?.some(l => l.language === mainLang);

            const mainLangLangNeedsEvaluation =
                languageType === LanguageTypes.MAIN &&
                language.languageCode !== translationLang &&
                !user?.languageLevels?.some(l => l.language === language.languageCode);

            if (
                (!mainLangLangNeedsEvaluation && !translationLangNeedsMainLangEvaluation) ||
                alwaysAllowPick
            ) {
                setters[languageType](language.languageCode);
            }

            triggerHaptics('rigid');
            onLanguagePick?.(
                language,
                mainLangLangNeedsEvaluation,
                translationLangNeedsMainLangEvaluation,
            );
        },
        [
            languageType,
            translationLang,
            mainLang,
            user,
            setMainLang,
            setTranslationLang,
            setApplicationLang,
            triggerHaptics,
            onLanguagePick,
        ],
    );

    const renderLanguageItem = useCallback(
        ({ item }: { item: Language }) => (
            <LanguageItem
                checked={item.languageCode === pickedLanguage}
                language={item}
                onboarding={onboarding}
                onPress={() => handleLanguagePick(item)}
            />
        ),
        [pickedLanguage, onboarding, handleLanguagePick],
    );

    return (
        <View style={style}>
            <Header
                style={styles.header}
                subtitle={t(`choose_language_${languageType}_desc`)}
                title={title ?? t(`choose_${langTypeDesc}_language`)}
            />
            <FlatList
                data={languagesData}
                renderItem={renderLanguageItem}
                scrollEnabled={false}
                style={styles.list}
            />
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
        },
    });
