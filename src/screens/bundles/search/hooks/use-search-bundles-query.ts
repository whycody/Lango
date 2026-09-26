import { useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';

import { wordsBundlesApi } from '../../../../api/words-bundles-api';
import { LanguageCode } from '../../../../constants/Language';
import { BundleSearchResponse } from '../../../../types';

const PAGE_SIZE = 20;

export const useSearchBundlesQuery = (
    q: string,
    mainLang: LanguageCode,
    translationLang: LanguageCode,
): UseInfiniteQueryResult<{ pageParams: number[]; pages: BundleSearchResponse[] }> =>
    useInfiniteQuery({
        enabled: q.trim().length > 0,
        getNextPageParam: (lastPage: BundleSearchResponse, allPages: BundleSearchResponse[]) => {
            const loaded = allPages.reduce((sum, page) => sum + page.data.length, 0);
            return loaded < lastPage.total ? loaded : undefined;
        },
        initialPageParam: 0,
        queryFn: async ({ pageParam }) => {
            const result = await wordsBundlesApi.searchWordsBundles(
                q,
                mainLang,
                translationLang,
                PAGE_SIZE,
                pageParam as number,
            );
            return result.kind === 'ok' ? result.data : { data: [], total: 0 };
        },
        queryKey: ['searchBundles', q, mainLang, translationLang],
    });
