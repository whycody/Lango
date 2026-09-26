import { FC, useState } from 'react';
import { StyleSheet } from 'react-native';

import { ApiErrorCode } from '../../../../api/api.types';
import { Alert } from '../../../../components';
import { MARGIN_HORIZONTAL, spacing } from '../../../../constants/margins';
import { BundleMemberWithUser } from '../../../../types';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { BundleMemberListItem } from '../components';
import { MEMBERS_ERROR_MESSAGE_KEYS } from '../constants';
import { RemoveMemberResult } from '../hooks';

interface RemoveMemberBottomSheetProps {
    isPublic: boolean;
    member: BundleMemberWithUser | null;
    sheetName: string;
    onCancel: () => void;
    onRemove: (member: BundleMemberWithUser) => Promise<RemoveMemberResult>;
    onRemoved: () => void;
}

export const RemoveMemberBottomSheet: FC<RemoveMemberBottomSheetProps> = ({
    isPublic,
    member,
    onCancel,
    onRemove,
    onRemoved,
    sheetName,
}) => {
    const [removing, setRemoving] = useState(false);
    const [errorCode, setErrorCode] = useState<ApiErrorCode | null>(null);

    const handleRemovePress = async () => {
        if (!member) return;
        setErrorCode(null);
        setRemoving(true);
        try {
            const result = await onRemove(member);
            if (!result.success) {
                setErrorCode(result.errorCode);
                return;
            }
            onRemoved();
        } finally {
            setRemoving(false);
        }
    };

    const handleDidDismiss = () => {
        setErrorCode(null);
    };

    const descriptionTx = isPublic
        ? 'bundle_details.members.remove_member.desc_public'
        : 'bundle_details.members.remove_member.desc_private';

    return (
        <GenericBottomSheet
            allowDismiss={!removing}
            descriptionTx={descriptionTx}
            primaryActionIcon="trash"
            primaryActionLabelTx="bundle_details.members.remove_member.confirm"
            primaryButtonLoading={removing}
            secondaryActionLabelTx="cancel"
            secondaryButtonEnabled={!removing}
            sheetName={sheetName}
            style={styles.content}
            titleTx="bundle_details.members.remove_member.title"
            onDidDismiss={handleDidDismiss}
            onPrimaryButtonPress={handleRemovePress}
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
