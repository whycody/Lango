import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageCode, LanguageTypes } from '../../../constants/Language';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../../constants/margins';
import { useHaptics } from '../../../hooks';
import { useAuth, useLanguage } from '../../../store';
import { Language } from '../../../types';
import { Header } from '../../components';
import { LanguageItem } from '../../components/language';

interface LanguagePickerProps {
    allLanguages?: boolean;
    alwaysAllowPick?: boolean;
    languageType?: LanguageTypes;
    onLanguagePick?: (language: Language, userEvaluatedLanguageLevel: boolean) => void;
    style?: ViewStyle;
}

export const LanguagePicker = (props: LanguagePickerProps) => {
    const { alwaysAllowPick, languageType = LanguageTypes.MAIN, onLanguagePick, style } = props;
    const styles = getStyles();
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

    const languagesData =
        languageType !== LanguageTypes.APPLICATION
            ? languages
            : languages.filter(lang =>
                  [LanguageCode.POLISH, LanguageCode.ENGLISH].includes(lang.languageCode),
              );

    const handleLanguagePick = useCallback(
        (language: Language) => {
            const setters: Record<LanguageTypes, (code: string) => void> = {
                [LanguageTypes.MAIN]: setMainLang,
                [LanguageTypes.TRANSLATION]: setTranslationLang,
                [LanguageTypes.APPLICATION]: setApplicationLang,
            };

            const userEvaluatedLanguageLevel =
                (languageType === LanguageTypes.MAIN && translationLang == language.languageCode) ||
                user.languageLevels?.some(level => level.language == language.languageCode);

            if (
                languageType !== LanguageTypes.MAIN ||
                userEvaluatedLanguageLevel ||
                alwaysAllowPick
            ) {
                setters[languageType](language.languageCode);
            }

            triggerHaptics('rigid');
            onLanguagePick?.(language, userEvaluatedLanguageLevel);
        },
        [
            languageType,
            translationLang,
            mainLang,
            setMainLang,
            setTranslationLang,
            setApplicationLang,
            triggerHaptics,
            onLanguagePick,
        ],
    );

    const renderLanguageItem = useCallback(
        ({ index, item }: { index: number; item: Language }) => (
            <LanguageItem
                checked={item.languageCode === pickedLanguage}
                index={index}
                language={item}
                onPress={() => handleLanguagePick(item)}
            />
        ),
        [pickedLanguage, handleLanguagePick],
    );

    return (
        <View style={style}>
            <Header
                style={styles.header}
                subtitle={t(`choose_language_${languageType}_desc`)}
                title={t(`choose_${langTypeDesc}_language`)}
            />
            <FlatList data={languagesData} renderItem={renderLanguageItem} scrollEnabled={false} />
        </View>
    );
};

const getStyles = () =>
    StyleSheet.create({
        header: {
            paddingHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: MARGIN_VERTICAL / 2,
        },
    });
