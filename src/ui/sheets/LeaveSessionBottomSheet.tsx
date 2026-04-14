import React from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { GenericBottomSheet } from './GenericBottomSheet';

type LeaveSessionBottomSheetProps = {
    leaveSession: () => void;
    sheetName: string;
};

export const LeaveSessionBottomSheet = (props: LeaveSessionBottomSheetProps) => {
    const { t } = useTranslation();

    const handlePrimaryButtonPress = () => {
        TrueSheet.dismiss(props.sheetName);
        props.leaveSession();
    };

    const handleSecondaryButtonPress = () => {
        TrueSheet.dismiss(props.sheetName);
    };

    return (
        <GenericBottomSheet
            description={t('finishingSessionDesc')}
            primaryActionLabel={t('finish')}
            secondaryActionLabel={t('cancel')}
            sheetName={props.sheetName}
            title={t('finishingSession')}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleSecondaryButtonPress}
        />
    );
};
