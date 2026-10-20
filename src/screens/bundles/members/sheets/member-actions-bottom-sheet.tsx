import { FC } from 'react';
import { StyleSheet } from 'react-native';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { spacing } from '../../../../constants/margins';
import { palette } from '../../../../constants/palette';
import { BundleMemberWithUser } from '../../../../types';
import { LibraryItem } from '../../../../ui/components/library';
import { GenericBottomSheet } from '../../../../ui/sheets/GenericBottomSheet';
import { hasBundleEditPermission } from '../../../../utils/bundle-helpers';
import { REMOVE_MEMBER_BOTTOM_SHEET, TRANSFER_OWNERSHIP_BOTTOM_SHEET } from '../constants';

interface MemberActionsBottomSheetProps {
    member: BundleMemberWithUser | null;
    sheetName: string;
    onGrantEdit: (member: BundleMemberWithUser) => void;
    onRevokeEdit: (member: BundleMemberWithUser) => void;
}

export const MemberActionsBottomSheet: FC<MemberActionsBottomSheetProps> = ({
    member,
    onGrantEdit,
    onRevokeEdit,
    sheetName,
}) => {
    const canEdit = member ? hasBundleEditPermission(member.role) : false;

    const handleGrantEditPress = () => {
        if (!member) return;
        TrueSheet.dismiss(sheetName);
        onGrantEdit(member);
    };

    const handleRevokeEditPress = () => {
        if (!member) return;
        TrueSheet.dismiss(sheetName);
        onRevokeEdit(member);
    };

    const handleTransferOwnershipPress = () => {
        TrueSheet.present(TRANSFER_OWNERSHIP_BOTTOM_SHEET);
    };

    const handleRemovePress = () => {
        TrueSheet.present(REMOVE_MEMBER_BOTTOM_SHEET);
    };

    return (
        <GenericBottomSheet
            secondaryActionLabelTx="cancel"
            sheetName={sheetName}
            style={styles.content}
            onSecondaryButtonPress={() => TrueSheet.dismiss(sheetName)}
        >
            {canEdit ? (
                <LibraryItem
                    color={palette.orange}
                    icon="pencil"
                    index={0}
                    labelTx="bundle_details.members.actions.revoke_edit"
                    onPress={handleRevokeEditPress}
                />
            ) : (
                <LibraryItem
                    color={palette.blue}
                    icon="pencil"
                    index={0}
                    labelTx="bundle_details.members.actions.grant_edit"
                    onPress={handleGrantEditPress}
                />
            )}
            <LibraryItem
                color={palette.purple}
                icon="swap-horizontal"
                index={1}
                labelTx="bundle_details.members.actions.transfer_ownership"
                onPress={handleTransferOwnershipPress}
            />
            <LibraryItem
                color={palette.red}
                icon="trash"
                index={2}
                labelTx="bundle_details.members.actions.remove_member"
                onPress={handleRemovePress}
            />
        </GenericBottomSheet>
    );
};

const styles = StyleSheet.create({
    content: {
        marginTop: spacing.l,
    },
});
