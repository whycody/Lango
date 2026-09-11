import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTheme } from '@react-navigation/native';

import { ApiErrorCode } from '../../../../api/api.types';
import { LabeledTextInput } from '../../../../components';
import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { useWordsBundle } from '../../../../store';
import { ThemeColors } from '../../../../types';
import { CustomText } from '../../../../ui/components/CustomText';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { CustomTheme } from '../../../../ui/Theme';

type JoinBundleWithCodeBottomSheetProps = {
    bundleId?: string;
    initialCode?: string;
    sheetName: string;
    onJoined: (bundleId: string) => void;
    onJoining?: () => void;
};

export const JoinBundleWithCodeBottomSheet = (props: JoinBundleWithCodeBottomSheetProps) => {
    const { bundleId, initialCode, onJoined, onJoining, sheetName } = props;
    const { joinWithCode } = useWordsBundle();
    const { colors } = useTheme() as CustomTheme;
    const styles = useMemo(() => getStyles(colors), [colors]);

    const [codeInput, setCodeInput] = useState(initialCode ?? '');
    const [isJoining, setIsJoining] = useState(false);
    const [errorCode, setErrorCode] = useState<ApiErrorCode | null>(null);

    const joinedBundleIdRef = useRef<string | undefined>(undefined);
    const textInputRef = useRef<TextInput>(null);

    const isConfirmed = codeInput.trim().length > 0;

    useEffect(() => {
        setCodeInput(initialCode ?? '');
    }, [initialCode]);

    const handleSheetWillPresent = () => {
        setCodeInput(initialCode ?? '');
        setErrorCode(null);
        textInputRef.current?.focus();
    };

    const handleSheetDismiss = () => {
        setCodeInput(initialCode ?? '');
        setErrorCode(null);

        if (joinedBundleIdRef.current) {
            const joinedBundleId = joinedBundleIdRef.current;
            joinedBundleIdRef.current = undefined;
            onJoined(joinedBundleId);
        }
    };

    const handleChangeText = (text: string) => {
        setCodeInput(text);
        setErrorCode(null);
    };

    const handlePrimaryButtonPress = async () => {
        const code = codeInput.trim();
        if (!code) return;

        try {
            setIsJoining(true);
            onJoining?.();
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

    const descriptionTx = initialCode
        ? 'bundle_details.join_with_code_sheet.desc_prefilled'
        : 'bundle_details.join_with_code_sheet.desc';

    const errorTx = errorCode
        ? errorCode === 'already-member'
            ? 'bundle_details.join_with_code_sheet.error_already_member'
            : 'bundle_details.join_with_code_sheet.error_invalid'
        : undefined;

    return (
        <GenericBottomSheet
            descriptionTx={descriptionTx}
            primaryActionLabelTx="bundle_details.join_with_code_sheet.confirm"
            primaryButtonEnabled={isConfirmed}
            primaryButtonLoading={isJoining}
            secondaryActionLabelTx="cancel"
            sheetName={sheetName}
            titleTx="bundle_details.join_with_code_sheet.title"
            onDidDismiss={handleSheetDismiss}
            onPrimaryButtonPress={handlePrimaryButtonPress}
            onSecondaryButtonPress={handleSecondaryButtonPress}
            onWillPresent={handleSheetWillPresent}
        >
            <LabeledTextInput
                autoCapitalize="characters"
                autoCorrect={false}
                inputRef={textInputRef}
                labelTx="bundle_details.join_with_code_sheet.placeholder"
                returnKeyType="done"
                value={codeInput}
                onChangeText={handleChangeText}
                onSubmitEditing={handlePrimaryButtonPress}
            />
            {errorCode && <CustomText style={styles.errorText} tx={errorTx} />}
        </GenericBottomSheet>
    );
};

const getStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        errorText: {
            color: colors.red,
            fontSize: 13,
            marginHorizontal: MARGIN_HORIZONTAL,
            marginTop: spacing.xs,
        },
    });
