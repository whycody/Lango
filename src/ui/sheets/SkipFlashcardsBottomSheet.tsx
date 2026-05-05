import React from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { GenericBottomSheet } from './GenericBottomSheet';

type SkipFlashcardsBottomSheetProps = {
    onConfirm: () => void;
    sheetName: string;
};

export const SkipFlashcardsBottomSheet = ({ onConfirm, sheetName }: SkipFlashcardsBottomSheetProps) => {
    const { t } = useTranslation();

    const handlePrimaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    const handleSecondaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
        onConfirm();
    };

    return (
        <GenericBottomSheet
            description={t('word_selection.skip_confirm_desc')}
            primaryActionLabel={t('word_selection.add_flashcards')}
            secondaryActionLabel={t('continue')}
            sheetName={sheetName}
            title={t('word_selection.skip_confirm')}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleSecondaryButtonPress}
        />
    );
};
