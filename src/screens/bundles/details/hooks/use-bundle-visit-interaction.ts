import { useEffect, useRef } from 'react';

import { useWordsBundle } from '../../../../store';
import { BundleMember } from '../../../../types';

// Server rejects interactions until the membership exists there, so wait for it to be synced.
export const useBundleVisitInteraction = (
    bundleId: string,
    membership: BundleMember | undefined,
): void => {
    const { touchBundleInteraction } = useWordsBundle();
    const hasTouched = useRef(false);
    const isMembershipSynced = !!membership && !membership.removed && membership.synced;

    useEffect(() => {
        if (!isMembershipSynced || hasTouched.current) return;
        hasTouched.current = true;
        touchBundleInteraction(bundleId);
    }, [bundleId, isMembershipSynced, touchBundleInteraction]);
};
