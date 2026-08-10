import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { wordsApi } from '../api/words-api';
import { Word } from '../types';

export const useBundleWordsQuery = (
    bundleId: string | undefined,
    enabled: boolean,
): UseQueryResult<Word[]> =>
    useQuery({
        enabled: !!bundleId && enabled,
        queryFn: async () => {
            const result = await wordsApi.fetchUpdatedWords(undefined, bundleId);
            return result.kind === 'ok' ? result.data : [];
        },
        queryKey: ['bundleWords', bundleId],
    });
