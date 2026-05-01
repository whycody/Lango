import React from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { GenericBottomSheet } from './GenericBottomSheet';

type SameLearningLanguageBottomSheetProps = {
    sheetName: string;
    onConfirm: () => void;
};

export const SameLearningLanguageBottomSheet = ({
    sheetName,
    onConfirm,
}: SameLearningLanguageBottomSheetProps) => {
    const { t } = useTranslation();

    const handleConfirm = async () => {
        await TrueSheet.dismiss(sheetName);
        onConfirm();
    };

    return (
        <GenericBottomSheet
            description={t('same_learning_language.desc')}
            primaryActionLabel={t('same_learning_language.change')}
            secondaryActionLabel={t('same_learning_language.confirm')}
            sheetName={sheetName}
            title={t('same_learning_language.title')}
            onPrimaryButtonPress={() => TrueSheet.dismiss(sheetName)}
            onSecondaryButtonPress={handleConfirm}
        />
    );
};
