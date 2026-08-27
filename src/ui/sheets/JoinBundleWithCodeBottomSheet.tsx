import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../constants/margins';
import { useWordsBundle } from '../../store';
import { CustomText } from '../components/CustomText';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';

type JoinBundleWithCodeBottomSheetProps = {
    initialCode?: string;
    sheetName: string;
    onJoined: () => void;
    onJoining: () => void;
};

export const JoinBundleWithCodeBottomSheet = (props: JoinBundleWithCodeBottomSheetProps) => {
    const { initialCode, onJoined, onJoining, sheetName } = props;
    const { joinWithCode } = useWordsBundle();
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const [codeInput, setCodeInput] = useState(initialCode ?? '');
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState(false);
    const joinedRef = useRef(false);

    const isConfirmed = codeInput.trim().length > 0;

    useEffect(() => {
        setCodeInput(initialCode ?? '');
    }, [initialCode]);

    const handleSheetWillPresent = () => {
        setCodeInput(initialCode ?? '');
        setError(false);
    };

    const handleSheetDismiss = () => {
        setCodeInput(initialCode ?? '');
        setError(false);

        if (joinedRef.current) {
            joinedRef.current = false;
            onJoined();
        }
    };

    const handleChangeText = (text: string) => {
        setCodeInput(text);
        setError(false);
    };

    const handlePrimaryButtonPress = async () => {
        const code = codeInput.trim();
        if (!code) return;

        try {
            setIsJoining(true);
            onJoining();
            const member = await joinWithCode(code);

            if (!member) {
                setError(true);
                return;
            }

            joinedRef.current = true;
            await TrueSheet.dismiss(sheetName);
        } finally {
            setIsJoining(false);
        }
    };

    const handleSecondaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    const description = t(
        initialCode
            ? 'bundle_details.join_with_code_sheet.desc_prefilled'
            : 'bundle_details.join_with_code_sheet.desc',
    );

    return (
        <GenericBottomSheet
            description={description}
            primaryActionLabel={t('bundle_details.join_with_code_sheet.confirm')}
            primaryButtonEnabled={isConfirmed}
            primaryButtonLoading={isJoining}
            secondaryActionLabel={t('cancel')}
            sheetName={sheetName}
            title={t('bundle_details.join_with_code_sheet.title')}
            onDidDismiss={handleSheetDismiss}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleSecondaryButtonPress}
            onWillPresent={handleSheetWillPresent}
        >
            <CustomText style={styles.inputLabel} weight="SemiBold">
                {t('bundle_details.join_with_code_sheet.placeholder')}
            </CustomText>
            <View style={styles.inputContainer}>
                <TextInput
                    autoCapitalize="characters"
                    autoCorrect={false}
                    cursorColor={colors.primary300}
                    returnKeyType="done"
                    style={styles.textInput}
                    value={codeInput}
                    onChangeText={handleChangeText}
                    onSubmitEditing={handlePrimaryButtonPress}
                />
            </View>
            {error && (
                <CustomText style={styles.errorText}>
                    {t('bundle_details.join_with_code_sheet.error_invalid')}
                </CustomText>
            )}
        </GenericBottomSheet>
    );
};

const getStyles = (colors: CustomTheme['colors']) =>
    StyleSheet.create({
        errorText: {
            color: colors.red,
            fontSize: 13,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.s,
        },
        inputContainer: {
            backgroundColor: colors.cardAccent,
            borderRadius: spacing.m,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: 6,
        },
        inputLabel: {
            color: colors.white300,
            fontSize: 13,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: MARGIN_VERTICAL,
        },
        textInput: {
            color: colors.white,
            fontFamily: `Montserrat-Regular`,
            fontSize: 15,
            marginHorizontal: MARGIN_HORIZONTAL,
            paddingVertical: 14,
        },
    });
