import { FC } from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { ActionButton } from '../../../../ui/components/ActionButton';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';

interface JoinPublicBundleBottomSheetProps {
    isJoining: boolean;
    sheetName: string;
    onJoinWithCode: () => void;
    onJoinWithoutCode: () => void;
}

export const JoinPublicBundleBottomSheet: FC<JoinPublicBundleBottomSheetProps> = ({
    isJoining,
    onJoinWithCode,
    onJoinWithoutCode,
    sheetName,
}) => {
    const handleSecondaryButtonPress = () => {
        TrueSheet.dismiss(sheetName);
    };

    return (
        <GenericBottomSheet
            descriptionTx="bundle_details.join_public_bundle_sheet.desc"
            secondaryActionLabelTx="cancel"
            sheetName={sheetName}
            style={styles.sheet}
            titleTx="bundle_details.join_public_bundle_sheet.title"
            onSecondaryButtonPress={handleSecondaryButtonPress}
        >
            <ActionButton
                primary
                active={!isJoining}
                labelTx="bundle_details.join_public_bundle_sheet.join_without_code"
                loading={isJoining}
                onPress={onJoinWithoutCode}
            />
            <ActionButton
                icon="key"
                labelTx="bundle_details.join_public_bundle_sheet.join_with_code"
                style={styles.secondaryButton}
                onPress={onJoinWithCode}
            />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    secondaryButton: {
        marginTop: spacing.l,
    },
    sheet: {
        marginHorizontal: MARGIN_HORIZONTAL,
        marginTop: spacing.xl,
    },
});
