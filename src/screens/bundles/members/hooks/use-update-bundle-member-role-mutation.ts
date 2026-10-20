import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';

import { ApiErrorCode } from '../../../../api/api.types';
import { bundleMembersApi } from '../../../../api/bundle-members-api';
import { BundleMember, BundleMemberRole } from '../../../../types';

type UpdateBundleMemberRoleVariables = {
    bundleId: string;
    memberId: string;
    role: BundleMemberRole;
};

type UpdateBundleMemberRoleResult =
    | { errorCode: ApiErrorCode; success: false }
    | { member: BundleMember; success: true };

export const useUpdateBundleMemberRoleMutation = (): UseMutationResult<
    UpdateBundleMemberRoleResult,
    never,
    UpdateBundleMemberRoleVariables
> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ memberId, role }: UpdateBundleMemberRoleVariables) => {
            const result = await bundleMembersApi.updateBundleMemberRole(memberId, role);
            if (result.kind !== 'ok') return { errorCode: result.errorCode, success: false };
            return { member: result.data, success: true };
        },
        onSuccess: (result, { bundleId }) => {
            if (!result.success) return;
            queryClient.invalidateQueries({ queryKey: ['bundleMembers', bundleId] });
        },
    });
};
