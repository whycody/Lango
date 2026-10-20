import { useState } from 'react';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { ApiErrorCode } from '../../../../api/api.types';
import { useWordsBundle } from '../../../../store';
import { BundleMemberWithUser } from '../../../../types';
import {
    MEMBER_ACTIONS_BOTTOM_SHEET,
    REMOVE_MEMBER_BOTTOM_SHEET,
    TRANSFER_OWNERSHIP_BOTTOM_SHEET,
} from '../constants';
import { useRemoveBundleMemberMutation } from './use-remove-bundle-member-mutation';
import { useUpdateBundleMemberRoleMutation } from './use-update-bundle-member-role-mutation';

export type TransferOwnershipResult =
    | { errorCode: ApiErrorCode; success: false }
    | { success: true };

export type RemoveMemberResult = { errorCode: ApiErrorCode; success: false } | { success: true };

interface UseBundleMembersActionsResult {
    handleGrantEdit: (member: BundleMemberWithUser) => void;
    handleMemberActionsPress: (member: BundleMemberWithUser) => void;
    handleRemove: (member: BundleMemberWithUser) => Promise<RemoveMemberResult>;
    handleRemoveCancel: () => void;
    handleRemoved: () => void;
    handleRemovePress: () => void;
    handleRevokeEdit: (member: BundleMemberWithUser) => void;
    handleTransferCancel: () => void;
    handleTransferOwnership: (member: BundleMemberWithUser) => Promise<TransferOwnershipResult>;
    handleTransferred: () => void;
    selectedMember: BundleMemberWithUser | null;
}

export const useBundleMembersActions = (bundleId: string): UseBundleMembersActionsResult => {
    const [selectedMember, setSelectedMember] = useState<BundleMemberWithUser | null>(null);
    const { syncBundles } = useWordsBundle();
    const { mutateAsync: updateMemberRole } = useUpdateBundleMemberRoleMutation();
    const { mutateAsync: removeMember } = useRemoveBundleMemberMutation();

    const handleMemberActionsPress = (member: BundleMemberWithUser) => {
        setSelectedMember(member);
        TrueSheet.present(MEMBER_ACTIONS_BOTTOM_SHEET);
    };

    const handleGrantEdit = (member: BundleMemberWithUser) => {
        updateMemberRole({ bundleId, memberId: member.id, role: 'editor' });
    };

    const handleRevokeEdit = (member: BundleMemberWithUser) => {
        updateMemberRole({ bundleId, memberId: member.id, role: 'viewer' });
    };

    const handleTransferOwnership = async (
        member: BundleMemberWithUser,
    ): Promise<TransferOwnershipResult> => {
        const result = await updateMemberRole({ bundleId, memberId: member.id, role: 'owner' });
        if (!result.success) return { errorCode: result.errorCode, success: false };
        await syncBundles();
        return { success: true };
    };

    const handleTransferred = () => {
        TrueSheet.dismissAll();
        setSelectedMember(null);
    };

    const handleTransferCancel = () => {
        TrueSheet.dismiss(TRANSFER_OWNERSHIP_BOTTOM_SHEET);
    };

    const handleRemovePress = () => {
        TrueSheet.present(REMOVE_MEMBER_BOTTOM_SHEET);
    };

    const handleRemove = async (member: BundleMemberWithUser): Promise<RemoveMemberResult> => {
        const result = await removeMember({ bundleId, memberId: member.id });
        if (!result.success) return { errorCode: result.errorCode, success: false };
        return { success: true };
    };

    const handleRemoved = () => {
        TrueSheet.dismissAll();
        setSelectedMember(null);
    };

    const handleRemoveCancel = () => {
        TrueSheet.dismiss(REMOVE_MEMBER_BOTTOM_SHEET);
    };

    return {
        handleGrantEdit,
        handleMemberActionsPress,
        handleRemove,
        handleRemoveCancel,
        handleRemoved,
        handleRemovePress,
        handleRevokeEdit,
        handleTransferCancel,
        handleTransferOwnership,
        handleTransferred,
        selectedMember,
    };
};
