import { ApiResponse } from 'apisauce';

import { BundleInteraction, SyncResultWithRejections } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';
import { FetchUpdatedBundleInteractionsApi, SyncBundleInteractionsOnServerApi } from './api.types';

const BUNDLE_INTERACTIONS_API_ROUTES = {
    bundleInteractions: (since: string) => `/bundle-interactions?since=${since}`,
    sync: '/bundle-interactions/sync',
} as const;

class BundleInteractionsApi {
    api: Api;

    constructor(api: Api) {
        this.api = api;
    }

    async syncBundleInteractionsOnServer(
        interactions: BundleInteraction[],
    ): Promise<SyncBundleInteractionsOnServerApi> {
        const response: ApiResponse<SyncResultWithRejections<BundleInteraction>> =
            await this.api.apisauce.post(BUNDLE_INTERACTIONS_API_ROUTES.sync, interactions);
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async fetchUpdatedBundleInteractions(
        since: string,
    ): Promise<FetchUpdatedBundleInteractionsApi> {
        const response: ApiResponse<BundleInteraction[]> = await this.api.apisauce.get(
            BUNDLE_INTERACTIONS_API_ROUTES.bundleInteractions(since),
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }
}

export const bundleInteractionsApi = new BundleInteractionsApi(api);
