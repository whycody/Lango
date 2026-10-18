import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { wordsApi } from '../../../../api/words-api';
import { Word } from '../../../../types';

export const useBundleWordsQuery = (
    bundleId: string | undefined,
    enabled: boolean,
): UseQueryResult<Word[]> =>
    useQuery({
        enabled: !!bundleId && enabled,
        queryFn: async () => {
            // refetch() ignores `enabled` and calls queryFn regardless, so a
            // disabled query (e.g. a private bundle preview with no access)
            // must guard here to stay a no-op.
            if (!enabled) return [];

            // Throw instead of resolving to [] so React Query retries - for a theme bundle
            // whose words are still being generated, 409/502 are expected and transient.
            const result = await wordsApi.fetchUpdatedWords(undefined, bundleId);
            if (result.kind !== 'ok') throw new Error(result.errorCode);
            return result.data;
        },
        queryKey: ['bundleWords', bundleId],
    });
