import React from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../store';
import { GenericBottomSheet } from './GenericBottomSheet';

type LogoutBottomSheetProps = {
    sheetName: string;
};

export const LogoutBottomSheet = ({ sheetName }: LogoutBottomSheetProps) => {
    const { logout } = useAuth();
    const { t } = useTranslation();

    const handlePrimaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
        logout();
    };

    const handleSecondaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    return (
        <GenericBottomSheet
            primaryActionLabel={t('logout')}
            secondaryActionLabel={t('cancel')}
            sheetName={sheetName}
            title={t('logout_confirm')}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleSecondaryButtonPress}
        />
    );
};
