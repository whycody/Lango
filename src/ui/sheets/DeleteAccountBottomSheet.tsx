import { useState } from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';

import { LabeledTextInput } from '../../components';
import { useAuth } from '../../store';
import { GenericBottomSheet } from './GenericBottomSheet';

const SHEET_NAME = 'delete-account-sheet';

type DeleteAccountBottomSheetProps = {
    sheetName?: string;
};

export const DeleteAccountBottomSheet = (props: DeleteAccountBottomSheetProps) => {
    const { sheetName = SHEET_NAME } = props;
    const { deleteUserAccount, user } = useAuth();
    const { t } = useTranslation();

    const [emailInput, setEmailInput] = useState('');
    const [accountDeleting, setAccountDeleting] = useState(false);

    const isConfirmed = emailInput.trim().toLowerCase() === user?.email.toLowerCase();

    const handleDismiss = () => {
        setEmailInput('');
    };

    const handlePrimaryButtonPress = async () => {
        setAccountDeleting(true);
        await deleteUserAccount();
        setAccountDeleting(false);
    };

    const handleSecondaryButtonPress = () => {
        setEmailInput('');
        TrueSheet.dismiss(sheetName);
    };

    return (
        <GenericBottomSheet
            allowDismiss={!accountDeleting}
            description={t('delete_account_sheet_desc', { email: user?.email })}
            primaryActionLabel={t('delete_account')}
            primaryButtonEnabled={isConfirmed}
            primaryButtonLoading={accountDeleting}
            secondaryActionLabel={t('cancel')}
            secondaryButtonEnabled={!accountDeleting}
            sheetName={sheetName}
            title={t('delete_account')}
            onDidDismiss={handleDismiss}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleSecondaryButtonPress}
        >
            <LabeledTextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder={t('email_address')}
                value={emailInput}
                onChangeText={setEmailInput}
            />
        </GenericBottomSheet>
    );
};
