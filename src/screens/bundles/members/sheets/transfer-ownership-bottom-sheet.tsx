import { FC, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ApiErrorCode } from '../../../../api/api.types';
import { Alert } from '../../../../components';
import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { BundleMemberWithUser } from '../../../../types';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { BundleMemberListItem } from '../components';
import { MEMBERS_ERROR_MESSAGE_KEYS } from '../constants';
import { TransferOwnershipResult } from '../hooks';

interface TransferOwnershipBottomSheetProps {
    member: BundleMemberWithUser | null;
    sheetName: string;
    onCancel: () => void;
    onTransfer: (member: BundleMemberWithUser) => Promise<TransferOwnershipResult>;
    onTransferred: () => void;
}

export const TransferOwnershipBottomSheet: FC<TransferOwnershipBottomSheetProps> = ({
    member,
    onCancel,
    onTransfer,
    onTransferred,
    sheetName,
}) => {
    const [transferring, setTransferring] = useState(false);
    const [errorCode, setErrorCode] = useState<ApiErrorCode | null>(null);

    const handleTransferPress = async () => {
        if (!member) return;
        setErrorCode(null);
        setTransferring(true);
        try {
            const result = await onTransfer(member);
            if (!result.success) {
                setErrorCode(result.errorCode);
                return;
            }
            onTransferred();
        } finally {
            setTransferring(false);
        }
    };

    const handleDidDismiss = () => {
        setErrorCode(null);
    };

    return (
        <GenericBottomSheet
            allowDismiss={!transferring}
            descriptionTx="bundle_details.members.transfer_ownership.desc"
            primaryActionIcon="swap-horizontal"
            primaryActionLabelTx="bundle_details.members.transfer_ownership.confirm"
            primaryButtonLoading={transferring}
            secondaryActionLabelTx="cancel"
            secondaryButtonEnabled={!transferring}
            sheetName={sheetName}
            style={styles.content}
            titleTx="bundle_details.members.transfer_ownership.title"
            onDidDismiss={handleDidDismiss}
            onPrimaryButtonPress={handleTransferPress}
            onSecondaryButtonPress={onCancel}
        >
            {member && (
                <BundleMemberListItem
                    isFirst
                    isCurrentUser={false}
                    member={member}
                    style={styles.member}
                />
            )}
            {errorCode && (
                <Alert
                    messageTx={MEMBERS_ERROR_MESSAGE_KEYS[errorCode]}
                    style={styles.alert}
                    titleTx="error"
                    type="error"
                />
            )}
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    alert: {
        marginBottom: spacing.none,
        marginTop: spacing.l,
    },
    content: {
        marginBottom: -spacing.m,
        paddingHorizontal: MARGIN_HORIZONTAL,
    },
    member: {
        marginTop: spacing.l,
    },
});
