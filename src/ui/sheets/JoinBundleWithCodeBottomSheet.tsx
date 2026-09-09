import { useEffect, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { ApiErrorCode } from '../../api/api.types';
import { MARGIN_HORIZONTAL, MARGIN_VERTICAL, spacing } from '../../constants/margins';
import { useWordsBundle } from '../../store';
import { CustomText } from '../components/CustomText';
import { CustomTheme } from '../Theme';
import { GenericBottomSheet } from './GenericBottomSheet';

type JoinBundleWithCodeBottomSheetProps = {
    bundleId?: string;
    initialCode?: string;
    sheetName: string;
    onJoined: (bundleId: string) => void;
    onJoining: () => void;
};

export const JoinBundleWithCodeBottomSheet = (props: JoinBundleWithCodeBottomSheetProps) => {
    const { bundleId, initialCode, onJoined, onJoining, sheetName } = props;
    const { joinWithCode } = useWordsBundle();
    const { colors } = useTheme() as CustomTheme;
    const { t } = useTranslation();
    const styles = getStyles(colors);

    const [codeInput, setCodeInput] = useState(initialCode ?? '');
    const [isJoining, setIsJoining] = useState(false);
    const [errorCode, setErrorCode] = useState<ApiErrorCode | undefined>(undefined);
    const joinedBundleIdRef = useRef<string | undefined>(undefined);
    const textInputRef = useRef<TextInput>(null);

    const isConfirmed = codeInput.trim().length > 0;

    useEffect(() => {
        setCodeInput(initialCode ?? '');
    }, [initialCode]);

    const handleSheetWillPresent = () => {
        setCodeInput(initialCode ?? '');
        setErrorCode(undefined);
        textInputRef.current?.focus();
    };

    const handleSheetDismiss = () => {
        setCodeInput(initialCode ?? '');
        setErrorCode(undefined);

        if (joinedBundleIdRef.current) {
            const joinedBundleId = joinedBundleIdRef.current;
            joinedBundleIdRef.current = undefined;
            onJoined(joinedBundleId);
        }
    };

    const handleChangeText = (text: string) => {
        setCodeInput(text);
        setErrorCode(undefined);
    };

    const handlePrimaryButtonPress = async () => {
        const code = codeInput.trim();
        if (!code) return;

        try {
            setIsJoining(true);
            onJoining();
            const result = await joinWithCode(code, bundleId);

            if (!result.success) {
                setErrorCode(result.errorCode);
                return;
            }

            joinedBundleIdRef.current = result.member.bundleId;
            await TrueSheet.dismissAll();
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
                    ref={textInputRef}
                    returnKeyType="done"
                    style={styles.textInput}
                    value={codeInput}
                    onChangeText={handleChangeText}
                    onSubmitEditing={handlePrimaryButtonPress}
                />
            </View>
            {errorCode && (
                <CustomText style={styles.errorText}>
                    {t(
                        errorCode === 'already-member'
                            ? 'bundle_details.join_with_code_sheet.error_already_member'
                            : 'bundle_details.join_with_code_sheet.error_invalid',
                    )}
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
