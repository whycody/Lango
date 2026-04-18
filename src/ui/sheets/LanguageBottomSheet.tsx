import React, { useCallback, useState } from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { LanguageTypes } from '../../constants/Language';
import { useLanguage } from '../../store';
import { Language } from '../../types';
import { LanguagePicker } from '../containers/language';
import { GenericBottomSheet } from './GenericBottomSheet';
import { PickLanguageLevelBottomSheet } from './PickLanguageLevelBottomSheet';

type LanguageBottomSheetProps = {
    allLanguages?: boolean;
    languageType?: LanguageTypes;
    sheetName: string;
};

export const LanguageBottomSheet = (props: LanguageBottomSheetProps) => {
    const { allLanguages, languageType = LanguageTypes.MAIN, sheetName } = props;
    const [pickedLanguage, setPickedLanguage] = useState<Language | null>(null);
    const [pendingTranslationLang, setPendingTranslationLang] = useState<Language | null>(null);
    const { t } = useTranslation();
    const { languages, mainLang, setMainLang, setTranslationLang } = useLanguage();
    const pickLevelSheetName = `${sheetName}-pick-level`;

    const handleLanguagePicked = useCallback(
        async (
            language: Language,
            mainLangNeedsEvaluation: boolean,
            translationLangNeedsMainLangEvaluation: boolean,
        ) => {
            await TrueSheet.dismiss(sheetName);

            if (!translationLangNeedsMainLangEvaluation && !mainLangNeedsEvaluation) {
                return;
            }

            if (translationLangNeedsMainLangEvaluation) {
                const mainLanguage = languages.find(l => l.languageCode === mainLang);
                if (!mainLanguage) return;
                setPendingTranslationLang(language);
                setPickedLanguage(mainLanguage);
                TrueSheet.present(pickLevelSheetName);
                return;
            }

            if (mainLangNeedsEvaluation) {
                const mainLanguage = languages.find(l => l.languageCode === language.languageCode);
                if (!mainLanguage) return;
                setPickedLanguage(mainLanguage);
                TrueSheet.present(pickLevelSheetName);
                return;
            }
        },
        [sheetName, pickLevelSheetName, languageType, languages, mainLang],
    );

    const handleLevelPicked = useCallback(() => {
        if (languageType === LanguageTypes.TRANSLATION && pendingTranslationLang) {
            setTranslationLang(pendingTranslationLang.languageCode);
        }
        if (languageType === LanguageTypes.MAIN && pickedLanguage) {
            setMainLang(pickedLanguage.languageCode);
        }

        setPendingTranslationLang(null);
    }, [languageType, pickedLanguage, pendingTranslationLang, setTranslationLang, setMainLang]);

    const handlePrimaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    return (
        <>
            <PickLanguageLevelBottomSheet
                language={pickedLanguage ?? undefined}
                sheetName={pickLevelSheetName}
                onLevelPick={handleLevelPicked}
            />
            <GenericBottomSheet
                primaryActionLabel={t('cancel')}
                sheetName={sheetName}
                onPrimaryButtonPress={handlePrimaryButtonPress}
            >
                <LanguagePicker
                    allLanguages={allLanguages}
                    languageType={languageType}
                    onLanguagePick={handleLanguagePicked}
                />
            </GenericBottomSheet>
        </>
    );
};
