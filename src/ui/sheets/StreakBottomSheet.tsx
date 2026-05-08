import React from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { Streak } from '../../types';
import { StreakBadge } from '../components/streak/StreakBadge';
import { GenericBottomSheet } from './GenericBottomSheet';

type StreakBottomSheetProps = {
    sheetName: string;
    finishSessionBottomSheetName: string;
    streak: Streak;
};

export const StreakBottomSheet = ({
    finishSessionBottomSheetName,
    sheetName,
    streak,
}: StreakBottomSheetProps) => {
    const { t } = useTranslation();

    const handlePrimaryButtonPress = () => {
        TrueSheet.present(finishSessionBottomSheetName);
    };

    return (
        <GenericBottomSheet
            allowDismiss={false}
            primaryActionLabel={t('continue')}
            sheetName={sheetName}
            onPrimaryButtonPress={handlePrimaryButtonPress}
        >
            <StreakBadge streak={streak.numberOfDays} />
        </GenericBottomSheet>
    );
};
