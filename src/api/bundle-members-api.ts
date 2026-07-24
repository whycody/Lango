import { ApiResponse } from 'apisauce';

import { BundleMember, SyncResultWithRejections } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';
import { FetchUpdatedBundleMembersApi, SyncBundleMembersOnServerApi } from './api.types';

const BUNDLE_MEMBERS_API_ROUTES = {
    bundleMembers: (since: string) => `/bundle-members?since=${since}`,
    sync: '/bundle-members/sync',
} as const;

class BundleMembersApi {
    api: Api;

    constructor(api: Api) {
        this.api = api;
    }

    async syncBundleMembersOnServer(
        members: BundleMember[],
    ): Promise<SyncBundleMembersOnServerApi> {
        const response: ApiResponse<SyncResultWithRejections<BundleMember>> =
            await this.api.apisauce.post(BUNDLE_MEMBERS_API_ROUTES.sync, members);
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async fetchUpdatedBundleMembers(since: string): Promise<FetchUpdatedBundleMembersApi> {
        const response: ApiResponse<BundleMember[]> = await this.api.apisauce.get(
            BUNDLE_MEMBERS_API_ROUTES.bundleMembers(since),
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }
}

export const bundleMembersApi = new BundleMembersApi(api);
