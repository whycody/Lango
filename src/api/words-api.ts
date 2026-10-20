import { ApiResponse } from 'apisauce';

import { SyncResultWithRejections, Word } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';
import { FetchUpdatedWordsApi, SyncWordsOnServerApi } from './api.types';

const WORDS_API_ROUTES = {
    sync: '/api/words/sync',
    words: '/api/words',
} as const;

class WordsApi {
    api: Api;

    constructor(api: Api) {
        this.api = api;
    }

    async syncWordsOnServer(words: Word[]): Promise<SyncWordsOnServerApi> {
        const response: ApiResponse<SyncResultWithRejections<Word>> = await this.api.apisauce.post(
            WORDS_API_ROUTES.sync,
            words,
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async fetchUpdatedWords(since?: string, bundleId?: string): Promise<FetchUpdatedWordsApi> {
        const response: ApiResponse<Word[]> = await this.api.apisauce.get(WORDS_API_ROUTES.words, {
            bundleId,
            since,
        });
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }
}

export const wordsApi = new WordsApi(api);
