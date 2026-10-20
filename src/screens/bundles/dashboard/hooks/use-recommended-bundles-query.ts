import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { wordsBundlesApi } from '../../../../api/words-bundles-api';
import { LanguageCode } from '../../../../constants/Language';
import { WordsBundleWithOwnerInfo } from '../../../../types';
import { RECOMMENDED_BUNDLES_STALE_TIME_MS } from '../constants';

// No recommendations exist for a pair where both languages are the same.
export const hasRecommendedBundles = (
    mainLang: LanguageCode,
    translationLang: LanguageCode,
): boolean => !!mainLang && !!translationLang && mainLang !== translationLang;

// The endpoint returns a random set on every call, so keep it fresh for a long time instead of
// refetching on every remount/focus - the list would reshuffle under the user. Pull-to-refresh
// calls refetch() explicitly.
export const useRecommendedBundlesQuery = (
    mainLang: LanguageCode,
    translationLang: LanguageCode,
): UseQueryResult<WordsBundleWithOwnerInfo[]> =>
    useQuery({
        enabled: hasRecommendedBundles(mainLang, translationLang),
        queryFn: async () => {
            // refetch() (pull-to-refresh) ignores `enabled`, so guard here as well.
            if (!hasRecommendedBundles(mainLang, translationLang)) return [];

            const result = await wordsBundlesApi.fetchRecommendedWordsBundles(
                mainLang,
                translationLang,
            );
            return result.kind === 'ok' ? result.data : [];
        },
        queryKey: ['recommendedBundles', mainLang, translationLang],
        staleTime: RECOMMENDED_BUNDLES_STALE_TIME_MS,
    });
