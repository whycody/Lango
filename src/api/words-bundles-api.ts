import { ApiResponse } from 'apisauce';

import { LanguageCode } from '../constants/Language';
import {
    BundleJoinCode,
    BundleMember,
    BundleMemberRole,
    BundleSearchResponse,
    JoinBundleWithCodeResult,
    SyncResultWithRejections,
    WordsBundle,
    WordsBundleWithOwnerInfo,
} from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';
import {
    DeleteWordsBundleOnServerApi,
    FetchUpdatedWordsBundlesApi,
    FetchWordsBundlesByIdsApi,
    GenerateBundleInvitationCodeApi,
    JoinBundleWithCodeApi,
    SearchWordsBundlesApi,
    SyncWordsBundlesOnServerApi,
} from './api.types';

const WORDS_BUNDLES_API_ROUTES = {
    byIds: '/words-bundles/by-ids',
    delete: (bundleId: string) => `/words-bundles/${bundleId}`,
    generateInvitationCode: (bundleId: string) =>
        `/words-bundles/${bundleId}/generate-invitation-code`,
    join: (code: string) => `/words-bundles/join/${code}`,
    search: '/words-bundles/search',
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

    async fetchWordsBundlesByIds(ids: string[]): Promise<FetchWordsBundlesByIdsApi> {
        if (ids.length === 0) return { data: [], kind: 'ok' };

        const response: ApiResponse<WordsBundleWithOwnerInfo[]> = await this.api.apisauce.get(
            WORDS_BUNDLES_API_ROUTES.byIds,
            { ids: ids.join(',') },
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
        const response: ApiResponse<JoinBundleWithCodeResult> = await this.api.apisauce.post(
            WORDS_BUNDLES_API_ROUTES.join(code),
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async searchWordsBundles(
        q: string,
        mainLang: LanguageCode,
        translationLang: LanguageCode,
        limit: number,
        offset: number,
    ): Promise<SearchWordsBundlesApi> {
        const response: ApiResponse<BundleSearchResponse> = await this.api.apisauce.get(
            WORDS_BUNDLES_API_ROUTES.search,
            { limit, mainLang, offset, q, translationLang },
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async deleteWordsBundleOnServer(bundleId: string): Promise<DeleteWordsBundleOnServerApi> {
        const response: ApiResponse<null> = await this.api.apisauce.delete(
            WORDS_BUNDLES_API_ROUTES.delete(bundleId),
        );
        if (!response.ok) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: null, kind: 'ok' };
    }
}

export const wordsBundlesApi = new WordsBundlesApi(api);
