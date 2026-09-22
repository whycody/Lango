import { useMutation, UseMutationResult, useQueryClient } from '@tanstack/react-query';

import { ApiErrorCode } from '../../../../api/api.types';
import { bundleMembersApi } from '../../../../api/bundle-members-api';
import { BundleMember } from '../../../../types';

type RemoveBundleMemberVariables = {
    bundleId: string;
    memberId: string;
};

type RemoveBundleMemberResult =
    | { errorCode: ApiErrorCode; success: false }
    | { member: BundleMember; success: true };

export const useRemoveBundleMemberMutation = (): UseMutationResult<
    RemoveBundleMemberResult,
    never,
    RemoveBundleMemberVariables
> => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ memberId }: RemoveBundleMemberVariables) => {
            const result = await bundleMembersApi.removeBundleMember(memberId);
            if (result.kind !== 'ok') return { errorCode: result.errorCode, success: false };
            return { member: result.data, success: true };
        },
        onSuccess: (result, { bundleId }) => {
            if (!result.success) return;
            queryClient.invalidateQueries({ queryKey: ['bundleMembers', bundleId] });
        },
    });
};
