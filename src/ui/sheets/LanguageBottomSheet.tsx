import React, { useCallback, useState } from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { LanguageTypes } from '../../constants/Language';
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
    const { t } = useTranslation();
    const pickLevelSheetName = `${sheetName}-pick-level`;

    const handleLanguagePicked = useCallback(
        (language: Language, userEvaluatedLanguageLevel: boolean) => {
            TrueSheet.dismiss(sheetName);
            if (userEvaluatedLanguageLevel || languageType !== LanguageTypes.MAIN) return;
            setPickedLanguage(language);
            TrueSheet.present(pickLevelSheetName);
        },
        [sheetName, pickLevelSheetName, languageType],
    );

    const handlePrimaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    return (
        <>
            <PickLanguageLevelBottomSheet
                language={pickedLanguage ?? undefined}
                sheetName={pickLevelSheetName}
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
