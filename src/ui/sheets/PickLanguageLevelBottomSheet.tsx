import React from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { Language } from '../../types';
import { LanguageLevelPicker } from '../containers/language/LanguageLevelPicker';
import { GenericBottomSheet } from './GenericBottomSheet';

type PickLanguageLevelBottomSheetProps = {
    language?: Language;
    onLevelPick?: () => void;
    allowDismiss?: boolean;
    sheetName: string;
};

export const PickLanguageLevelBottomSheet = (props: PickLanguageLevelBottomSheetProps) => {
    const { t } = useTranslation();

    const dismiss = () => TrueSheet.dismiss(props.sheetName);

    const handleLevelPick = () => {
        props.onLevelPick?.();
        dismiss();
    };

    return (
        <GenericBottomSheet
            allowDismiss={props.allowDismiss ?? true}
            primaryActionLabel={t('general.cancel')}
            primaryButtonEnabled={props.allowDismiss ?? true}
            sheetName={props.sheetName}
            onPrimaryButtonPress={dismiss}
        >
            <LanguageLevelPicker language={props.language} onLevelPick={handleLevelPick} />
        </GenericBottomSheet>
    );
};
