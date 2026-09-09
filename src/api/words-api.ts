import { ApiResponse } from 'apisauce';

import { ApiErrorCode, SyncResultWithRejections, Word } from '../types';
import { resolveApiErrorCode } from '../utils/apiErrorUtils';
import { Api, api } from './api';

const WORDS_API_ROUTES = {
    sync: '/api/words/sync',
    words: '/api/words',
} as const;

export type WordsApiResult<T> =
    | { data: T; kind: 'ok' }
    | { errorCode: ApiErrorCode; kind: 'error' };

class WordsApi {
    api: Api;
    constructor(api: Api) {
        this.api = api;
    }

    async syncWordsOnServer(
        words: Word[],
    ): Promise<WordsApiResult<SyncResultWithRejections<Word>>> {
        const response: ApiResponse<SyncResultWithRejections<Word>> = await this.api.apisauce.post(
            WORDS_API_ROUTES.sync,
            words,
        );
        if (!response.ok || !response.data) {
            return { errorCode: resolveApiErrorCode(response), kind: 'error' };
        }
        return { data: response.data, kind: 'ok' };
    }

    async fetchUpdatedWords(since?: string, bundleId?: string): Promise<WordsApiResult<Word[]>> {
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
