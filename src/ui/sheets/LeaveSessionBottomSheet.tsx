import React from 'react';
import { useTranslation } from 'react-i18next';

import { GenericBottomSheet } from './GenericBottomSheet';

type LeaveSessionBottomSheetProps = {
    leaveSession: () => void;
    sheetName: string;
};

export const LeaveSessionBottomSheet = (props: LeaveSessionBottomSheetProps) => {
    const { t } = useTranslation();

    return (
        <GenericBottomSheet
            description={t('finishingSessionDesc')}
            primaryActionLabel={t('finish')}
            secondaryActionLabel={t('cancel')}
            sheetName={props.sheetName}
            title={t('finishingSession')}
            onPrimaryButtonPress={props.leaveSession}
        />
    );
};
