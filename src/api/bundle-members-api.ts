import { ApiResponse } from 'apisauce';

import {
    BundleMember,
    BundleMemberRole,
    BundleMemberWithUser,
    SyncResultWithRejections,
} from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';
import {
    FetchBundleMembersApi,
    FetchUpdatedBundleMembersApi,
    RemoveBundleMemberApi,
    SyncBundleMembersOnServerApi,
    UpdateBundleMemberRoleApi,
    UpdateBundleMemberRoleRequest,
} from './api.types';

const BUNDLE_MEMBERS_API_ROUTES = {
    bundleMembers: (since: string) => `/bundle-members?since=${since}`,
    byBundle: (bundleId: string) => `/bundle-members/bundle/${bundleId}`,
    byId: (memberId: string) => `/bundle-members/${memberId}`,
    role: (memberId: string) => `/bundle-members/${memberId}/role`,
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

    async fetchBundleMembers(bundleId: string): Promise<FetchBundleMembersApi> {
        const response: ApiResponse<BundleMemberWithUser[]> = await this.api.apisauce.get(
            BUNDLE_MEMBERS_API_ROUTES.byBundle(bundleId),
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async updateBundleMemberRole(
        memberId: string,
        role: BundleMemberRole,
    ): Promise<UpdateBundleMemberRoleApi> {
        const response: ApiResponse<BundleMember> = await this.api.apisauce.patch(
            BUNDLE_MEMBERS_API_ROUTES.role(memberId),
            { role } satisfies UpdateBundleMemberRoleRequest,
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async removeBundleMember(memberId: string): Promise<RemoveBundleMemberApi> {
        const response: ApiResponse<BundleMember> = await this.api.apisauce.delete(
            BUNDLE_MEMBERS_API_ROUTES.byId(memberId),
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }
}

export const bundleMembersApi = new BundleMembersApi(api);
