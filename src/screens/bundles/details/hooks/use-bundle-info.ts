import { useWordsBundle } from '../../../../store';
import { WordsBundleWithOwnerInfo } from '../../../../types';
import { hasBundleEditPermission } from '../../../../utils/bundle-helpers';
import { useBundleQuery } from './use-bundle-query';

export const useBundleInfo = (
    bundleId: string,
    previewBundle: WordsBundleWithOwnerInfo | undefined,
) => {
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

    const previewBundleData = previewOwnerInfo
        ? { ...previewOwnerInfo, membership: undefined }
        : undefined;
    const bundle = isPreview ? previewBundleData : localBundle;

    const membership = bundle?.membership;
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
