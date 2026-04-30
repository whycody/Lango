import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL } from '../../constants/margins';
import { useAuth } from '../../store';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';

const SHEET_NAME = 'delete-account-sheet';

type DeleteAccountBottomSheetProps = {
    sheetName?: string;
};

export const DeleteAccountBottomSheet = (props: DeleteAccountBottomSheetProps) => {
    const { sheetName = SHEET_NAME } = props;
    const { deleteUserAccount, user } = useAuth();
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);

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
            sheetName={sheetName}
            title={t('delete_account')}
            onDidDismiss={handleDismiss}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleSecondaryButtonPress}
        >
            <View style={styles.inputContainer}>
                <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    cursorColor={colors.primary300}
                    keyboardType="email-address"
                    placeholder={t('email_address')}
                    placeholderTextColor={colors.primary600}
                    style={styles.textInput}
                    value={emailInput}
                    onChangeText={setEmailInput}
                />
            </View>
        </GenericBottomSheet>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        inputContainer: {
            backgroundColor: colors.background,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL / 2,
        },
        textInput: {
            color: colors.primary,
            fontFamily: `Montserrat-Regular`,
            fontSize: 15,
            paddingHorizontal: 14,
            paddingVertical: 14,
        },
    });
