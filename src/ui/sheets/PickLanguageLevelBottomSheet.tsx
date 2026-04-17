import React from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../store';
import { Language } from '../../types';
import { LanguageLevelPicker } from '../containers/language/LanguageLevelPicker';
import { GenericBottomSheet } from './GenericBottomSheet';

export const PickLanguageLevelBottomSheet = (props: PickLanguageLevelBottomSheetProps) => {
    const { t } = useTranslation();
    const { mainLang } = useLanguage();

    const dismiss = () => TrueSheet.dismiss(props.sheetName);

    // Do not allow dismissing when user doesn't have information about language level
    // and has already picked it in previous version of app
    const allowDismiss = mainLang !== props.language?.languageCode;

    return (
        <GenericBottomSheet
            allowDismiss={allowDismiss}
            primaryActionLabel={t('general.cancel')}
            primaryButtonEnabled={allowDismiss}
            sheetName={props.sheetName}
            onPrimaryButtonPress={dismiss}
        >
            <LanguageLevelPicker language={props.language} onLevelPick={dismiss} />
        </GenericBottomSheet>
    );
};

type PickLanguageLevelBottomSheetProps = {
    language?: Language;
    sheetName: string;
};
