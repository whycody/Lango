import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { bundleMembersApi } from '../../../../api/bundle-members-api';
import { useWordsBundle } from '../../../../store';
import { BundleMemberWithUser } from '../../../../types';
import { isBundleOwnerStale } from '../utils';

export const useBundleMembersQuery = (
    bundleId: string | undefined,
): UseQueryResult<BundleMemberWithUser[]> => {
    const { bundles, syncBundles } = useWordsBundle();

    return useQuery({
        enabled: !!bundleId,
        queryFn: async () => {
            const result = await bundleMembersApi.fetchBundleMembers(bundleId!);
            if (result.kind !== 'ok') return [];

            const localOwnerId = bundles.find(bundle => bundle.id === bundleId)?.ownerId;
            if (isBundleOwnerStale(result.data, localOwnerId)) {
                await syncBundles();
            }

            return result.data;
        },
        queryKey: ['bundleMembers', bundleId],
    });
};
