import { UseQueryResult } from '@tanstack/react-query';

import { useWordsBundle } from '../../../../store';
import { EnrichedWordsBundle } from '../../../../store/WordsBundleContext';
import { BundleMember, WordsBundleWithOwnerInfo } from '../../../../types';
import { hasBundleEditPermission } from '../../../../utils/bundle-helpers';
import { useBundleQuery } from './use-bundle-query';

interface UseBundleInfoResult {
    bundle: EnrichedWordsBundle | WordsBundleWithOwnerInfo | undefined;
    canAddWords: boolean;
    isBundleQueryLoading: boolean;
    isPreview: boolean;
    isPrivatePreview: boolean;
    localBundle: EnrichedWordsBundle | undefined;
    membership: BundleMember | undefined;
    previewOwnerInfo: WordsBundleWithOwnerInfo | null;
    refetchBundle: UseQueryResult<WordsBundleWithOwnerInfo | null>['refetch'];
}

export const useBundleInfo = (
    bundleId: string,
    previewBundle: WordsBundleWithOwnerInfo | undefined,
): UseBundleInfoResult => {
    const { bundles } = useWordsBundle();

    const localBundle = bundles.find(b => b.id === bundleId);
    const isPreview = !localBundle || localBundle.membership?.removed === true;

    const {
        data: rawPreviewOwnerInfo,
        isLoading: isBundleQueryLoading,
        refetch: refetchBundle,
    } = useBundleQuery(bundleId, isPreview, previewBundle);

    // The query reports `undefined` while it's still loading and `null` once it
    // has resolved with no bundle found; collapse both into `null` so consumers
    // only need to handle a single "no data yet" case.
    const previewOwnerInfo = rawPreviewOwnerInfo ?? null;

    const bundle = isPreview ? (previewOwnerInfo ?? undefined) : localBundle;

    // A bundle being previewed has no membership yet by definition.
    const membership = isPreview ? undefined : localBundle?.membership;
    const canAddWords = !isPreview && hasBundleEditPermission(membership?.role);
    const isPrivatePreview = isPreview && bundle?.visibility === 'private';

    return {
        bundle,
        canAddWords,
        isBundleQueryLoading,
        isPreview,
        isPrivatePreview,
        localBundle,
        membership,
        previewOwnerInfo,
        refetchBundle,
    };
};
