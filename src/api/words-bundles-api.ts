import { ApiResponse } from 'apisauce';

import { BundleJoinCode, BundleMember, BundleMemberRole, SyncResultWithRejections, WordsBundle } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';
import {
    FetchUpdatedWordsBundlesApi,
    GenerateBundleInvitationCodeApi,
    JoinBundleWithCodeApi,
    SyncWordsBundlesOnServerApi,
} from './api.types';

const WORDS_BUNDLES_API_ROUTES = {
    generateInvitationCode: (bundleId: string) =>
        `/words-bundles/${bundleId}/generate-invitation-code`,
    join: (code: string) => `/words-bundles/join/${code}`,
    sync: '/words-bundles/sync',
    wordsBundles: (since: string) => `/words-bundles?since=${since}`,
} as const;

class WordsBundlesApi {
    api: Api;

    constructor(api: Api) {
        this.api = api;
    }

    async syncWordsBundlesOnServer(bundles: WordsBundle[]): Promise<SyncWordsBundlesOnServerApi> {
        const response: ApiResponse<SyncResultWithRejections<WordsBundle>> =
            await this.api.apisauce.post(WORDS_BUNDLES_API_ROUTES.sync, bundles);
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async fetchUpdatedWordsBundles(since: string): Promise<FetchUpdatedWordsBundlesApi> {
        const response: ApiResponse<WordsBundle[]> = await this.api.apisauce.get(
            WORDS_BUNDLES_API_ROUTES.wordsBundles(since),
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async generateBundleInvitationCode(
        bundleId: string,
        role: Extract<BundleMemberRole, 'editor' | 'viewer'>,
    ): Promise<GenerateBundleInvitationCodeApi> {
        const response: ApiResponse<BundleJoinCode> = await this.api.apisauce.post(
            WORDS_BUNDLES_API_ROUTES.generateInvitationCode(bundleId),
            { role },
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async joinBundleWithCode(code: string): Promise<JoinBundleWithCodeApi> {
        const response: ApiResponse<BundleMember> = await this.api.apisauce.post(
            WORDS_BUNDLES_API_ROUTES.join(code),
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }
}

export const wordsBundlesApi = new WordsBundlesApi(api);
