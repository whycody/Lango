import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { wordsBundlesApi } from '../../../../api/words-bundles-api';
import { WordsBundleWithOwnerInfo } from '../../../../types';

export const useBundleQuery = (
    bundleId: string | undefined,
    enabled: boolean,
    placeholderData?: WordsBundleWithOwnerInfo,
): UseQueryResult<WordsBundleWithOwnerInfo | null> =>
    useQuery({
        enabled: !!bundleId && enabled,
        placeholderData,
        queryFn: async () => {
            const result = await wordsBundlesApi.fetchWordsBundlesByIds([bundleId as string]);
            if (result.kind !== 'ok') return null;
            return result.data[0] ?? null;
        },
        queryKey: ['bundle', bundleId],
    });
